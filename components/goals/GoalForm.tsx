'use client';

import { useState } from 'react';
import { formatCurrency, parseCurrencyToCents } from '@/lib/validation';

interface GoalFormProps {
  initialData?: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  };
  onSubmit: (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function GoalForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: GoalFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(
    initialData?.targetAmount
      ? formatCurrency(initialData.targetAmount).replace('R$', '').trim()
      : ''
  );
  const [currentAmount, setCurrentAmount] = useState(
    initialData?.currentAmount
      ? formatCurrency(initialData.currentAmount).replace('R$', '').trim()
      : ''
  );
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().split('T')[0]
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Informe um nome para a meta.');
      return;
    }

    const targetInCents = parseCurrencyToCents(targetAmount);
    if (!targetAmount || isNaN(targetInCents) || targetInCents <= 0) {
      setError('Insira um valor alvo válido.');
      return;
    }

    if (!deadline) {
      setError('Selecione uma data limite.');
      return;
    }

    const currentInCents = currentAmount ? parseCurrencyToCents(currentAmount) : 0;
    if (currentAmount && isNaN(currentInCents)) {
      setError('Valor atual inválido.');
      return;
    }

    if (currentInCents > targetInCents) {
      setError('O valor atual não pode ultrapassar o valor alvo.');
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        name,
        targetAmount: targetInCents,
        currentAmount: currentInCents,
        deadline: new Date(deadline).toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar meta');
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
          Nome da Meta *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Reserva de emergência, Viagem de férias"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Valor Alvo (R$) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">
              R$
            </span>
            <input
              type="text"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Valor já acumulado (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">
              R$
            </span>
            <input
              type="text"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Prazo limite *
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
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
          {loading ? 'Salvando...' : isEditing ? 'Atualizar meta' : 'Criar meta'}
        </button>
      </div>
    </form>
  );
}
