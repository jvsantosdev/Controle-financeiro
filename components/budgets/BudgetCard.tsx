'use client';

import { formatCurrency } from '@/lib/validation';

interface BudgetCardProps {
  budget: {
    id: string;
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    progress: number;
    month: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const isOver = budget.spent > budget.limit;
  const isWarning = budget.progress >= 80 && !isOver;

  const barColor = isOver
    ? 'bg-rose-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const badgeColor = isOver
    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60'
    : isWarning
    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60'
    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60';

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${badgeColor}`}>
            {budget.category}
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(budget.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(budget.id)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(budget.spent)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              de {formatCurrency(budget.limit)} ({budget.progress}%)
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(budget.progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Pill Row */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Limite
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {formatCurrency(budget.limit)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isOver ? 'Excedente' : 'Disponível'}
            </span>
            <p
              className={`text-sm font-bold mt-0.5 ${
                isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatCurrency(Math.abs(budget.remaining))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
