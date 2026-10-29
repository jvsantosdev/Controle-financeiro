'use client';

import { formatCurrency, formatDatePtBR } from '@/lib/validation';

interface GoalCardProps {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    createdAt: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddAmount?: (id: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete, onAddAmount }: GoalCardProps) {
  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const isExpired = !isCompleted && new Date(goal.deadline) < new Date();

  const statusBadge = isCompleted ? (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
      Concluída 🎉
    </span>
  ) : isExpired ? (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
      Expirada
    </span>
  ) : (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
      Em andamento
    </span>
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {goal.name}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Prazo: {formatDatePtBR(goal.deadline)} • {daysRemaining} dias restantes
            </p>
          </div>
          {statusBadge}
        </div>

        {/* Progress bar */}
        <div className="mt-4 mb-5">
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">
              Meta: {formatCurrency(goal.targetAmount)} ({progress}%)
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isExpired
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Info pills */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Acumulado
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isCompleted ? 'Superávit' : 'Faltam'}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {formatCurrency(Math.max(0, remaining))}
            </p>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(goal.id)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>

        {onAddAmount && !isCompleted && !isExpired && (
          <button
            onClick={() => onAddAmount(goal.id)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xs"
          >
            + Aportar
          </button>
        )}
      </div>
    </div>
  );
}
