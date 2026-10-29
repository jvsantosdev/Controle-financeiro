'use client';

import TransactionForm from '@/components/transactions/TransactionForm';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';

export default function NewTransactionPage() {
  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="mb-8">
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-3 transition-colors"
          >
            ← Voltar para transações
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Nova Transação
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Preencha os detalhes da entrada ou saída.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <TransactionForm />
        </div>
      </div>
    </AppShell>
  );
}
