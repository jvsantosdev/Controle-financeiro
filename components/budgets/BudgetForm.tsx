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

export default function BudgetForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: BudgetFormProps) {
  const [category, setCategory] = useState(initialData?.category || '');
  const [limit, setLimit] = useState(
    initialData?.limit ? formatCurrency(initialData.limit).replace('R$', '').trim() : ''
  );
  const [month, setMonth] = useState(
    initialData?.month
      ? new Date(initialData.month).toISOString().split('T')[0]
      : ''
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
    'Supermercado',
    'Assinaturas',
    'Outros',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category.trim()) {
      setError('Selecione uma categoria.');
      return;
    }

    if (!limit || parseFloat(limit) <= 0) {
      setError('Insira um teto de gastos válido.');
      return;
    }

    if (!month) {
      setError('Selecione o mês de referência.');
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-xl text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Categoria *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          required
        >
          <option value="">Selecione a categoria</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Limite mensal estipulado (R$) *
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">
            R$
          </span>
          <input
            type="text"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0,00"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Mês de vigência *
        </label>
        <input
          type="month"
          value={month.substring(0, 7)}
          onChange={(e) => setMonth(e.target.value + '-01')}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {loading
            ? 'Gravando...'
            : isEditing
            ? 'Atualizar orçamento'
            : 'Criar orçamento'}
        </button>
      </div>
    </form>
  );
}
