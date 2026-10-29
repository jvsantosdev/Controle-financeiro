'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, parseCurrencyToCents } from '@/lib/validation';

interface BudgetFormProps {
  initialData?: {
    category: string;
    limit: number;
    month: string;
  };
  onSubmit: (data: { category: string; limit: number; month: string }) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function BudgetForm({ initialData, onSubmit, onCancel, isEditing = false }: BudgetFormProps) {
  const [category, setCategory] = useState(initialData?.category || '');
  const [limit, setLimit] = useState(initialData?.limit ? formatCurrency(initialData.limit).replace('R$', '').trim() : '');
  const [month, setMonth] = useState(
    initialData?.month ? new Date(initialData.month).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!month && !initialData?.month) {
      setMonth(new Date().toISOString().split('T')[0].substring(0, 7) + '-01');
    }
  }, [initialData?.month]);
  
  const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Lazer',
    'Educação',
    'Vestuário',
    'Beleza',
    'Supermercado',
    'Restaurante',
    'Assinaturas',
    'Outros',
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!category.trim()) {
      setError('Selecione uma categoria');
      return;
    }
    
    if (!limit || parseFloat(limit) <= 0) {
      setError('Insira um limite válido');
      return;
    }
    
    if (!month) {
      setError('Selecione um mês');
      return;
    }
    
    try {
      setLoading(true);
      const limitInCents = parseCurrencyToCents(limit);
      await onSubmit({
        category,
        limit: limitInCents,
        month: new Date(month).toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar orçamento');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Categoria *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Limite mensal (R$) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">R$</span>
          <input
            type="text"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0,00"
            className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Valor limite para esta categoria no mês selecionado
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Mês *
        </label>
        <input
          type="month"
          value={month.substring(0, 7)}
          onChange={(e) => setMonth(e.target.value + '-01')}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : isEditing ? 'Atualizar orçamento' : 'Criar orçamento'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}