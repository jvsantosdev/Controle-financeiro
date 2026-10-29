import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // TODO: Uncomment when Prisma is ready
    // const userId = await getCurrentUserId();
    
    // Mock data for now
    const mockTransactions = [
      {
        id: '1',
        description: 'Supermercado',
        amount: -15000, // in cents
        date: '2024-10-01',
        category: 'Alimentação',
        type: 'EXPENSE' as const,
        paymentMethodId: '1',
        status: 'PAID' as const,
      },
      {
        id: '2',
        description: 'Salário',
        amount: 450000,
        date: '2024-10-01',
        category: 'Salário',
        type: 'INCOME' as const,
        status: 'PAID' as const,
      },
      {
        id: '3',
        description: 'Gasolina',
        amount: -20000,
        date: '2024-09-30',
        category: 'Transporte',
        type: 'EXPENSE' as const,
        paymentMethodId: '2',
        status: 'PAID' as const,
      },
      {
        id: '4',
        description: 'Restaurante',
        amount: -8000,
        date: '2024-09-28',
        category: 'Alimentação',
        type: 'EXPENSE' as const,
        status: 'PAID' as const,
      },
      {
        id: '5',
        description: 'Netflix',
        amount: -3990,
        date: '2024-09-25',
        category: 'Lazer',
        type: 'EXPENSE' as const,
        status: 'PENDING' as const,
      },
    ];
    
    return NextResponse.json(mockTransactions);
  } catch (error: any) {
    console.error('Error fetching latest transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch latest transactions' },
      { status: 500 }
    );
  }
}