'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TransactionForm from '@/components/transactions/TransactionForm';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const transactionResponse = await fetch(`/api/transactions/${id}`);
        if (!transactionResponse.ok) {
          throw new Error('Transação não encontrada');
        }
        const transactionData = await transactionResponse.json();
        setTransaction(transactionData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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
            Editar Transação
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Atualize os dados desta movimentação.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            Carregando transação...
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-2xl text-sm">
            {error}
          </div>
        ) : transaction ? (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <TransactionForm initialData={transaction} />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
