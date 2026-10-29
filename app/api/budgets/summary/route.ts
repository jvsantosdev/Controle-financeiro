import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month') || new Date().toISOString();
    const month = new Date(monthParam);
    
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { category: 'asc' },
    });
    
    const categorySpending = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        type: 'EXPENSE',
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    
    const spendingMap = new Map<string, number>();
    for (const item of categorySpending) {
      spendingMap.set(item.category, Math.abs(item._sum.amount ?? 0));
    }
    
    const budgetsWithSpending = budgets.map((budget) => {
      const spent = spendingMap.get(budget.category) ?? 0;
      const remaining = budget.limit - spent;
      const progress = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0;
      return {
        ...budget,
        spent,
        remaining,
        progress,
      };
    });
    
    const totalLimit = budgets.reduce((sum: number, b) => sum + b.limit, 0);
    const totalSpent = budgetsWithSpending.reduce((sum: number, b) => sum + b.spent, 0);
    const overallProgress = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;
    
    return NextResponse.json({
      month: month.toISOString(),
      budgets: budgetsWithSpending,
      summary: {
        totalLimit,
        totalSpent,
        overallProgress,
        budgetCount: budgets.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching budget summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budget summary' },
      { status: 500 }
    );
  }
}
