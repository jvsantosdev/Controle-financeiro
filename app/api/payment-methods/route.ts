import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';
import { paymentMethodSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(paymentMethods);
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    
    const validated = paymentMethodSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        ...data,
        userId,
      },
    });
    
    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment method' },
      { status: 500 }
    );
  }
}
