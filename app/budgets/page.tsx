'use client';

import { useState, useEffect } from 'react';
import BudgetCard from '@/components/budgets/BudgetCard';
import BudgetForm from '@/components/budgets/BudgetForm';
import { formatCurrency } from '@/lib/validation';
import AppShell from '@/components/layout/AppShell';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  progress: number;
  month: string;
}

interface BudgetSummary {
  month: string;
  budgets: Budget[];
  summary: {
    totalLimit: number;
    totalSpent: number;
    overallProgress: number;
    budgetCount: number;
  };
}

export default function BudgetsPage() {
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    setSelectedMonth(new Date().toISOString().split('T')[0].substring(0, 7));
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchBudgets();
    }
  }, [selectedMonth]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budgets/summary?month=${selectedMonth}-01`);
      if (!response.ok) throw new Error('Falha ao carregar orçamentos');
      const data = await response.json();
      setBudgetSummary(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (data: { category: string; limit: number; month: string }) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar orçamento');
      }

      setShowForm(false);
      fetchBudgets();
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditBudget = async (data: { category: string; limit: number; month: string }) => {
    if (!editingBudgetId) return;

    try {
      const response = await fetch(`/api/budgets/${editingBudgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar orçamento');
      }

      setEditingBudgetId(null);
      fetchBudgets();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir orçamento');
      }

      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditClick = (id: string) => {
    const budget = budgetSummary?.budgets.find((b) => b.id === id);
    if (budget) {
      setEditingBudgetId(id);
      setShowForm(true);
    }
  };

  const currentMonthName = selectedMonth
    ? new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Orçamentos Mensais
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Defina limites máximos por categoria para economizar de forma consistente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={() => {
              setEditingBudgetId(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-32"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 mb-8 bg-rose-50 text-rose-700 rounded-xl text-sm">{error}</div>
      ) : budgetSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Teto Total Estipulado
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatCurrency(budgetSummary.summary.totalLimit)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Distribuído em {budgetSummary.summary.budgetCount} categorias
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Consumido no Mês
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(budgetSummary.summary.totalSpent)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 capitalize">
              Referente a {currentMonthName}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Consumo do Limite
            </span>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    budgetSummary.summary.overallProgress > 90
                      ? 'bg-rose-500'
                      : budgetSummary.summary.overallProgress > 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budgetSummary.summary.overallProgress, 100)}%` }}
                />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {budgetSummary.summary.overallProgress}%
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {budgetSummary.summary.overallProgress >= 100
                ? '⚠️ Limite global atingido'
                : 'Dentro da margem planejada'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Categories Grid */}
      {loading ? null : budgetSummary && budgetSummary.budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 text-2xl flex items-center justify-center mx-auto mb-3">
            📊
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Nenhum orçamento para este mês
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-5">
            Crie limites para categorias como Alimentação, Transporte ou Lazer.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            Criar primeiro orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetSummary?.budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditClick}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Modal / Form overlay */}
      {(showForm || editingBudgetId) && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingBudgetId ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBudgetId(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <BudgetForm
              initialData={
                editingBudgetId
                  ? budgetSummary?.budgets.find((b) => b.id === editingBudgetId)
                  : undefined
              }
              onSubmit={editingBudgetId ? handleEditBudget : handleCreateBudget}
              onCancel={() => {
                setShowForm(false);
                setEditingBudgetId(null);
              }}
              isEditing={!!editingBudgetId}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
