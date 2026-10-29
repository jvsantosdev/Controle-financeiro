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
        if (!response.ok) throw new Error('Falha ao buscar transações recentes');
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
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xs text-rose-600 dark:text-rose-400">
        Não foi possível carregar os lançamentos: {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhuma transação recente encontrada.
        </p>
        <Link
          href="/transactions/new"
          className="inline-block mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          + Adicionar primeiro lançamento
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'INCOME';
        return (
          <div
            key={transaction.id}
            className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                  isIncome
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                }`}
              >
                {isIncome ? '↓' : '↑'}
              </div>

              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {transaction.category}
                  </span>
                  {transaction.status === 'PENDING' && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`font-bold text-sm tracking-tight ${
                  isIncome
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isIncome ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {formatDatePtBR(transaction.date)}
              </p>
            </div>
          </div>
        );
      })}

      <div className="pt-2 text-center">
        <Link
          href="/transactions"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          Ver histórico completo de transações
        </Link>
      </div>
    </div>
  );
}
