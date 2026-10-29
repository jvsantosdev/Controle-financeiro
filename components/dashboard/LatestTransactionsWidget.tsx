'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDatePtBR } from '@/lib/validation';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING';
}

export default function LatestTransactionsWidget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions/latest');
        if (!response.ok) throw new Error('Failed to fetch latest transactions');
        const data = await response.json();
        setTransactions(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTransactions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-gray-500 text-center py-8">
        Erro ao carregar transações: {error}
      </p>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Nenhuma transação cadastrada.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="p-4 border-b hover:bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{transaction.description}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{transaction.category}</span>
                {transaction.status === 'PENDING' && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pendente
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${
                transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
              </p>
              <p className="text-sm text-gray-500">{formatDatePtBR(transaction.date)}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6 text-center">
        <Link
          href="/transactions"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver todas as transações →
        </Link>
      </div>
    </div>
  );
}