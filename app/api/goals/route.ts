import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { goalSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
    
    if (status) {
      const now = new Date();
      if (status === 'active') {
        goals = goals.filter(
          (g) => g.currentAmount < g.targetAmount && new Date(g.deadline) >= now
        );
      } else if (status === 'completed') {
        goals = goals.filter((g) => g.currentAmount >= g.targetAmount);
      } else if (status === 'expired') {
        goals = goals.filter(
          (g) => g.currentAmount < g.targetAmount && new Date(g.deadline) < now
        );
      }
    }
    
    return NextResponse.json(goals);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    
    const validated = goalSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    const goal = await prisma.goal.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
        userId,
      },
    });
    
    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create goal' },
      { status: 500 }
    );
  }
}
