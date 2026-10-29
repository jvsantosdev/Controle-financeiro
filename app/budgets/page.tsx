'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';
import BudgetCard from '@/components/budgets/BudgetCard';
import BudgetForm from '@/components/budgets/BudgetForm';
import ThemeToggle from '@/components/ThemeToggle';
import { formatCurrency } from '@/lib/validation';

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
  const { data: session } = useSession();
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
      if (!response.ok) throw new Error('Failed to fetch budgets');
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
        throw new Error(errorData.error || 'Failed to create budget');
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
        throw new Error(errorData.error || 'Failed to update budget');
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
        throw new Error(errorData.error || 'Failed to delete budget');
      }
      
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditClick = (id: string) => {
    const budget = budgetSummary?.budgets.find(b => b.id === id);
    if (budget) {
      setEditingBudgetId(id);
      setShowForm(true);
    }
  };

  const currentMonthName = new Date(`${selectedMonth}-01`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-gray-600">Defina limites por categoria e acompanhe seus gastos.</p>
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

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium mb-2">Selecione o mês:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Novo orçamento
          </button>
        </div>
      </div>

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
          Erro ao carregar orçamentos: {error}
        </div>
      ) : budgetSummary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
              <h3 className="font-bold text-lg mb-2">Total orçado</h3>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(budgetSummary.summary.totalLimit)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {budgetSummary.summary.budgetCount} categorias
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
              <h3 className="font-bold text-lg mb-2">Total gasto</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(budgetSummary.summary.totalSpent)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {currentMonthName}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
              <h3 className="font-bold text-lg mb-2">Progresso geral</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${Math.min(budgetSummary.summary.overallProgress, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {budgetSummary.summary.overallProgress}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {budgetSummary.summary.overallProgress >= 100 ? 'Orçamento esgotado' : 'Dentro do orçamento'}
              </p>
            </div>
          </div>

          {budgetSummary.budgets.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500 mb-4">
                Nenhum orçamento definido para {currentMonthName}.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar primeiro orçamento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {budgetSummary.budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteBudget}
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      {(showForm || editingBudgetId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingBudgetId ? 'Editar orçamento' : 'Novo orçamento'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudgetId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <BudgetForm
                initialData={
                  editingBudgetId
                    ? budgetSummary?.budgets.find(b => b.id === editingBudgetId)
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
        </div>
      )}
    </div>
  );
}