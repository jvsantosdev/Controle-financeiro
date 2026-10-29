'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/validation';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryDistributionChart from '@/components/dashboard/CategoryDistributionChart';
import LatestTransactionsWidget from '@/components/dashboard/LatestTransactionsWidget';
import AppShell from '@/components/layout/AppShell';

interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingTransactions: number;
  paymentMethodsCount: number;
  upcomingBills: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/summary');
        if (!response.ok) throw new Error('Não foi possível carregar o resumo financeiro');
        const data = await response.json();
        setSummary(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Usuário';

  return (
    <AppShell>
      {/* Top Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Olá, {userName} 👋
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Aqui está o panorama completo da sua saúde financeira.
        </p>
      </div>

      {/* Main Metric Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-32"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 mb-8 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-sm">
          {error}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {/* Saldo Atual */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Saldo Disponível
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                💰
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(summary.totalBalance)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Patrimônio líquido em caixa
            </p>
          </div>

          {/* Receitas */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Entradas (Mês)
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                ↑
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {formatCurrency(summary.monthlyIncome)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Total creditado neste mês
            </p>
          </div>

          {/* Despesas */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Saídas (Mês)
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-bold">
                ↓
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(summary.monthlyExpenses)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Total gasto no período
            </p>
          </div>

          {/* Contas a Pagar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Faturas a Pagar
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
                💳
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {formatCurrency(summary.upcomingBills)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Próximos vencimentos
            </p>
          </div>

          {/* Transações Pendentes */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Pendentes
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                ⏳
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {summary.pendingTransactions}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Aguardando confirmação
            </p>
          </div>

          {/* Métodos de Pagamento */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Métodos Ativos
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                ✨
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
              {summary.paymentMethodsCount}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Cartões, contas e PIX cadastrados
            </p>
          </div>
        </div>
      ) : null}

      {/* Quick Navigation Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/transactions/new"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
              ➕
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nova Transação</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Entrada ou saída</span>
          </Link>

          <Link
            href="/cards"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-xs group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
              💳
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Meus Cartões</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Gerenciar faturas</span>
          </Link>

          <Link
            href="/budgets"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
              📊
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Orçamentos</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Limites por categoria</span>
          </Link>

          <Link
            href="/goals"
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-xs group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Metas</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Acompanhar poupança</span>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Análise Financeira
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <IncomeExpenseChart />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CategoryDistributionChart />
          </div>
        </div>
      </div>

      {/* Latest Transactions and Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Últimas Transações
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <LatestTransactionsWidget />
        </div>

        {/* Financial Insights Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Insights & Boas Práticas
            </h2>
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  💡 Regra dos 50-30-20
                </p>
                <p className="text-xs text-emerald-700/90 dark:text-emerald-400 leading-relaxed">
                  Reserve 50% para necessidades, 30% para desejos pessoais e 20% para suas metas financeiras.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                  🛡️ Fundo de Emergência
                </p>
                <p className="text-xs text-blue-700/90 dark:text-blue-400 leading-relaxed">
                  Busque acumular entre 3 e 6 meses de despesas fixas para imprevistos.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/goals"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Planejar nova meta de poupança →
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
