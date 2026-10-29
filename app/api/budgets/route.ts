import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { budgetSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    const where: any = { userId };
    if (month) {
      const monthDate = new Date(month);
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      where.month = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }
    
    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { month: 'desc' },
    });
    
    return NextResponse.json(budgets);
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    
    const validated = budgetSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    const monthDate = new Date(data.month);
    
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        category: data.category,
        month: {
          gte: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
          lte: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
        },
      },
    });
    
    if (existingBudget) {
      return NextResponse.json(
        { error: 'Budget for this category and month already exists' },
        { status: 409 }
      );
    }
    
    const budget = await prisma.budget.create({
      data: {
        ...data,
        month: new Date(data.month),
        userId,
      },
    });
    
    return NextResponse.json(budget, { status: 201 });
  } catch (error: any) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create budget' },
      { status: 500 }
    );
  }
}