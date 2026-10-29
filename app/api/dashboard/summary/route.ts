import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // TODO: Uncomment when Prisma is ready
    // const userId = await getCurrentUserId();
    
    // Mock data for now
    const mockSummary = {
      totalBalance: 125000, // in cents
      monthlyIncome: 450000,
      monthlyExpenses: 325000,
      pendingTransactions: 3,
      paymentMethodsCount: 2,
      upcomingBills: 150000, // in cents
    };
    
    return NextResponse.json(mockSummary);
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}