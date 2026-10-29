import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { updateGoalSchema } from '@/lib/validation';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    
    const goal = await prisma.goal.findUnique({
      where: { id },
    });
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    
    if (goal.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(goal);
  } catch (error: any) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();
    
    const validated = updateGoalSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    const existingGoal = await prisma.goal.findUnique({
      where: { id },
    });
    
    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    
    if (existingGoal.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updatedData: any = {};
    if (data.name !== undefined) updatedData.name = data.name;
    if (data.targetAmount !== undefined) updatedData.targetAmount = data.targetAmount;
    if (data.currentAmount !== undefined) updatedData.currentAmount = data.currentAmount;
    if (data.deadline !== undefined) updatedData.deadline = new Date(data.deadline);
    
    const goal = await prisma.goal.update({
      where: { id },
      data: updatedData,
    });
    
    return NextResponse.json(goal);
  } catch (error: any) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    
    const goal = await prisma.goal.findUnique({
      where: { id },
    });
    
    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }
    
    if (goal.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await prisma.goal.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Goal deleted' });
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
