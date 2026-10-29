'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import ThemeToggle from '@/components/ThemeToggle';
import { formatCurrency } from '@/lib/validation';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export default function GoalsPage() {
  const { data: session } = useSession();
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
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      setGoals(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (data: { name: string; targetAmount: number; currentAmount: number; deadline: string }) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create goal');
      }
      
      setShowForm(false);
      fetchGoals();
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditGoal = async (data: { name: string; targetAmount: number; currentAmount: number; deadline: string }) => {
    if (!editingGoalId) return;
    
    try {
      const response = await fetch(`/api/goals/${editingGoalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update goal');
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
        throw new Error(errorData.error || 'Failed to delete goal');
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
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      const amountToAddInCents = parseFloat(addAmountValue) * 100;
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
        throw new Error(errorData.error || 'Failed to update goal');
      }
      
      setAddingAmountGoalId(null);
      setAddAmountValue('');
      fetchGoals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditClick = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      setEditingGoalId(id);
      setShowForm(true);
    }
  };

  const handleAddAmountClick = (id: string) => {
    setAddingAmountGoalId(id);
  };

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
  
  const activeGoals = goals.filter(goal => 
    goal.currentAmount < goal.targetAmount && new Date(goal.deadline) >= new Date()
  );
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);
  const expiredGoals = goals.filter(goal => 
    goal.currentAmount < goal.targetAmount && new Date(goal.deadline) < new Date()
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Metas de poupança</h1>
          <p className="text-gray-600">Defina metas financeiras e acompanhe seu progresso.</p>
        </div>
        <div className="flex items-center gap-4">
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Todas ({goals.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Ativas ({activeGoals.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Concluídas ({completedGoals.length})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg ${filter === 'expired' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Expiradas ({expiredGoals.length})
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nova meta
          </button>
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
            Erro ao carregar metas: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
              <h3 className="font-bold text-lg mb-2">Total alvo</h3>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalTarget)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {goals.length} metas
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
              <h3 className="font-bold text-lg mb-2">Total arrecadado</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalCurrent)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {totalProgress}% do total
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500">
              <h3 className="font-bold text-lg mb-2">Progresso geral</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${Math.min(totalProgress, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {totalProgress}%
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {completedGoals.length} metas concluídas
              </p>
            </div>
          </div>
        )}
      </div>


      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 mb-8 bg-red-50 text-red-700 rounded-lg">
          Erro ao carregar metas: {error}
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">
            Nenhuma meta cadastrada ainda.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              onEdit={handleEditClick}
              onDelete={handleDeleteGoal}
              onAddAmount={handleAddAmountClick}
            />
          ))}
        </div>
      )}


      {(showForm || editingGoalId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingGoalId ? 'Editar meta' : 'Nova meta'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoalId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <GoalForm
                initialData={
                  editingGoalId
                    ? goals.find(g => g.id === editingGoalId)
                    : undefined
                }
                onSubmit={editingGoalId ? handleEditGoal : handleCreateGoal}
                onCancel={() => {
                  setShowForm(false);
                  setEditingGoalId(null);
                }}
                isEditing={!!editingGoalId}
              />
            </div>
          </div>
        </div>
      )}


      {addingAmountGoalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Adicionar valor à meta</h2>
                <button
                  onClick={() => {
                    setAddingAmountGoalId(null);
                    setAddAmountValue('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor a adicionar (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={addAmountValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9,]/g, '');
                        setAddAmountValue(value);
                      }}
                      placeholder="0,00"
                      className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAddAmount(addingAmountGoalId)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setAddingAmountGoalId(null);
                      setAddAmountValue('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}