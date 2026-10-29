import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { updatePaymentMethodSchema } from '@/lib/validation';

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
    
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
    });
    
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    
    if (paymentMethod.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(paymentMethod);
  } catch (error: any) {
    console.error('Error fetching payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment method' },
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
    
    const validated = updatePaymentMethodSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    
    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updated = await prisma.paymentMethod.update({
      where: { id },
      data,
    });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment method' },
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
    
    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    
    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await prisma.paymentMethod.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Payment method deleted' });
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
