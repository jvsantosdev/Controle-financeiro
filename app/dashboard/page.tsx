'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { formatCurrency } from '@/lib/validation';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryDistributionChart from '@/components/dashboard/CategoryDistributionChart';
import LatestTransactionsWidget from '@/components/dashboard/LatestTransactionsWidget';

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
        if (!response.ok) throw new Error('Failed to fetch dashboard summary');
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

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas finanças.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {session && (
            <div className="text-sm">
              <span className="font-medium">{session.user?.name || session.user?.email}</span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 mb-8 bg-red-50 text-red-700 rounded-lg">
          Erro ao carregar dados: {error}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
            <h3 className="font-bold text-lg mb-2">Saldo atual</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(summary.totalBalance)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Saldo disponível
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h3 className="font-bold text-lg mb-2">Receitas este mês</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(summary.monthlyIncome)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total de entradas
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
            <h3 className="font-bold text-lg mb-2">Despesas este mês</h3>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(summary.monthlyExpenses)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total de saídas
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
            <h3 className="font-bold text-lg mb-2">Transações pendentes</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {summary.pendingTransactions}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Aguardando pagamento
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
            <h3 className="font-bold text-lg mb-2">Métodos de pagamento</h3>
            <p className="text-3xl font-bold text-purple-600">
              {summary.paymentMethodsCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Cartões e outras formas
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-indigo-500">
            <h3 className="font-bold text-lg mb-2">Contas a pagar</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {formatCurrency(summary.upcomingBills)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Próximas despesas
            </p>
          </div>
        </div>
      ) : null}

      {/* Charts */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Gráficos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <IncomeExpenseChart />
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/transactions/new"
            className="p-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex flex-col items-center justify-center text-center"
          >
            <span className="text-2xl mb-2">💵</span>
            <span className="font-medium">Nova transação</span>
          </Link>
          <Link
            href="/cards"
            className="p-4 bg-purple-100 text-purple-800 rounded-lg shadow hover:bg-purple-200 flex flex-col items-center justify-center text-center"
          >
            <span className="text-2xl mb-2">💳</span>
            <span className="font-medium">Gerenciar cartões</span>
          </Link>
          <Link
            href="/budgets"
            className="p-4 bg-green-100 text-green-800 rounded-lg shadow hover:bg-green-200 flex flex-col items-center justify-center text-center"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="font-medium">Ver orçamentos</span>
          </Link>
          <Link
            href="/goals"
            className="p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow hover:bg-yellow-200 flex flex-col items-center justify-center text-center"
          >
            <span className="text-2xl mb-2">🎯</span>
            <span className="font-medium">Metas de poupança</span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Últimas transações</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <LatestTransactionsWidget />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Dicas financeiras</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">💡 Economize em supermercado</h4>
                <p className="text-blue-700">
                  Sua maior despesa é com alimentação. Considere fazer compras semanais em atacados.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">💰 Crie uma reserva de emergência</h4>
                <p className="text-green-700">
                  Mantenha pelo menos 3 meses de despesas em uma conta separada para imprevistos.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">📅 Acompanhe seus cartões</h4>
                <p className="text-purple-700">
                  Configure lembretes para datas de fechamento e vencimento dos seus cartões.
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button className="text-gray-600 hover:text-gray-800 font-medium">
                Ver mais dicas →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}