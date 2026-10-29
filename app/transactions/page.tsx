'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDatePtBR } from '@/lib/validation';
import AppShell from '@/components/layout/AppShell';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.type) query.set('type', filters.type);
      if (filters.category) query.set('category', filters.category);

      const response = await fetch(`/api/transactions?${query.toString()}`);
      if (!response.ok) throw new Error('Não foi possível carregar as transações');

      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters.type, filters.category]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir transação');

      fetchTransactions();
    } catch (err: any) {
      alert('Erro ao excluir transação: ' + err.message);
    }
  };

  const categories = Array.from(new Set(transactions.map((t: any) => t.category)));

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transações
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Histórico completo de entradas, saídas e pagamentos.
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Transação</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="">Todos os tipos</option>
              <option value="INCOME">Receitas (+)</option>
              <option value="EXPENSE">Despesas (-)</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat: any) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 dark:text-slate-500 animate-pulse">
            Carregando transações...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-2xl flex items-center justify-center mx-auto mb-3">
              📝
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Nenhuma transação encontrada
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-5">
              Comece cadastrando suas primeiras entradas ou despesas para acompanhar seu fluxo.
            </p>
            <Link
              href="/transactions/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-xs transition-all"
            >
              Adicionar primeira transação
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80">
                <tr>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5">Descrição</th>
                  <th className="hidden sm:table-cell px-5 py-3.5">Categoria</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5 text-right">Valor</th>
                  <th className="px-5 py-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {transactions.map((transaction: any) => {
                  const isIncome = transaction.type === 'INCOME';
                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {formatDatePtBR(transaction.date)}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {transaction.description}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {isIncome ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 whitespace-nowrap font-bold text-right ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center text-xs">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/transactions/${transaction.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
