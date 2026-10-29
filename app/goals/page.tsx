'use client';

import { useState, useEffect } from 'react';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import { formatCurrency } from '@/lib/validation';
import AppShell from '@/components/layout/AppShell';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [addingAmountGoalId, setAddingAmountGoalId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [addAmountValue, setAddAmountValue] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/goals' : `/api/goals?status=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao carregar metas');
      const data = await response.json();
      setGoals(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar meta');
      }

      setShowForm(false);
      fetchGoals();
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditGoal = async (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }) => {
    if (!editingGoalId) return;

    try {
      const response = await fetch(`/api/goals/${editingGoalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar meta');
      }

      setEditingGoalId(null);
      fetchGoals();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao excluir meta');
      }

      fetchGoals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAmount = async (goalId: string) => {
    if (!addAmountValue || parseFloat(addAmountValue) <= 0) {
      setError('Insira um valor válido');
      return;
    }

    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const amountToAddInCents = Math.round(parseFloat(addAmountValue.replace(',', '.')) * 100);
      const newCurrentAmount = goal.currentAmount + amountToAddInCents;

      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAmount: newCurrentAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar valor da meta');
      }

      setAddingAmountGoalId(null);
      setAddAmountValue('');
      fetchGoals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalProgress =
    totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

  const activeGoals = goals.filter(
    (goal) => goal.currentAmount < goal.targetAmount && new Date(goal.deadline) >= new Date()
  );
  const completedGoals = goals.filter((goal) => goal.currentAmount >= goal.targetAmount);
  const expiredGoals = goals.filter(
    (goal) => goal.currentAmount < goal.targetAmount && new Date(goal.deadline) < new Date()
  );

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Metas de Poupança
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Planeje objetivos de curto, médio e longo prazo e acompanhe o acúmulo.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGoalId(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Total Alvo (Objetivo)
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalTarget)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{goals.length} metas cadastradas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Total Já Guardado
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalCurrent)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{totalProgress}% atingido do montante</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
            Progresso Geral
          </span>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(totalProgress, 100)}%` }}
              />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{totalProgress}%</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {completedGoals.length} de {goals.length} metas concluídas
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {[
          { id: 'all', label: 'Todas', count: goals.length },
          { id: 'active', label: 'Ativas', count: activeGoals.length },
          { id: 'completed', label: 'Concluídas', count: completedGoals.length },
          { id: 'expired', label: 'Expiradas', count: expiredGoals.length },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-48"
            />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 text-2xl flex items-center justify-center mx-auto mb-3">
            🎯
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Nenhuma meta encontrada
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-6">
            Defina uma meta para viagem, reserva de emergência ou aquisição de bens.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(id) => {
                setEditingGoalId(id);
                setShowForm(true);
              }}
              onDelete={handleDeleteGoal}
              onAddAmount={(id) => setAddingAmountGoalId(id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingGoalId) && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingGoalId ? 'Editar Meta' : 'Nova Meta de Poupança'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingGoalId(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <GoalForm
              initialData={editingGoalId ? goals.find((g) => g.id === editingGoalId) : undefined}
              onSubmit={editingGoalId ? handleEditGoal : handleCreateGoal}
              onCancel={() => {
                setShowForm(false);
                setEditingGoalId(null);
              }}
              isEditing={!!editingGoalId}
            />
          </div>
        </div>
      )}

      {/* Add Amount Modal */}
      {addingAmountGoalId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Aportar Valor à Meta</h2>
              <button
                onClick={() => {
                  setAddingAmountGoalId(null);
                  setAddAmountValue('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Valor do Aporte (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">R$</span>
                  <input
                    type="text"
                    value={addAmountValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9,]/g, '');
                      setAddAmountValue(val);
                    }}
                    placeholder="150,00"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => handleAddAmount(addingAmountGoalId)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
                >
                  Confirmar Aporte
                </button>
                <button
                  onClick={() => {
                    setAddingAmountGoalId(null);
                    setAddAmountValue('');
                  }}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
