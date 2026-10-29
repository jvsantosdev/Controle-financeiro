import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { updateTransactionSchema } from '@/lib/validation';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: Context
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    
    const transaction = await prisma.transaction.findUnique({
      where: { id, userId },
      include: { paymentMethod: true },
    });
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Context
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    const body = await request.json();
    
    const validated = updateTransactionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    // Check if transaction exists and belongs to user
    const existing = await prisma.transaction.findUnique({
      where: { id, userId },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    const transaction = await prisma.transaction.update({
      where: { id, userId },
      data: {
        ...data,
        amount: data.amount !== undefined ? data.amount : existing.amount,
        date: data.date ? new Date(data.date) : existing.date,
      },
    });
    
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await params;
    
    // Check if transaction exists and belongs to user
    const existing = await prisma.transaction.findUnique({
      where: { id, userId },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    await prisma.transaction.delete({
      where: { id, userId },
    });
    
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
