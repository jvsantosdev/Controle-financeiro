import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { updateBudgetSchema } from '@/lib/validation';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    
    const budget = await prisma.budget.findUnique({
      where: { id },
    });
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    if (budget.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(budget);
  } catch (error: any) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();
    
    const validated = updateBudgetSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    });
    
    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    if (existingBudget.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updatedData: any = {};
    if (data.category !== undefined) updatedData.category = data.category;
    if (data.limit !== undefined) updatedData.limit = data.limit;
    if (data.month !== undefined) updatedData.month = new Date(data.month);
    
    const budget = await prisma.budget.update({
      where: { id },
      data: updatedData,
    });
    
    return NextResponse.json(budget);
  } catch (error: any) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    
    const budget = await prisma.budget.findUnique({
      where: { id },
    });
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    if (budget.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await prisma.budget.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
