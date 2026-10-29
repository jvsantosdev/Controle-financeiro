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
  const progressColor = budget.progress >= 90 ? 'bg-red-500' :
                       budget.progress >= 75 ? 'bg-yellow-500' : 'bg-green-500';
  
  const textColor = budget.progress >= 90 ? 'text-red-600' :
                    budget.progress >= 75 ? 'text-yellow-600' : 'text-green-600';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{budget.category}</h3>
          <p className="text-sm text-gray-500">
            Mês: {new Date(budget.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(budget.id)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Gasto</span>
            <span className={`font-bold ${textColor}`}>
              {formatCurrency(budget.spent)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-300`}
              style={{ width: `${Math.min(budget.progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">0</span>
            <span className="text-gray-500">{budget.progress}%</span>
            <span className="text-gray-500">{formatCurrency(budget.limit)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-700">Limite</p>
            <p className="font-bold text-lg">{formatCurrency(budget.limit)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-green-700">Restante</p>
            <p className="font-bold text-lg">{formatCurrency(Math.max(0, budget.remaining))}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {budget.remaining > 0 ? (
            <p>Você ainda pode gastar <span className="font-bold text-green-600">{formatCurrency(budget.remaining)}</span> nesta categoria.</p>
          ) : (
            <p className="text-red-600">Orçamento esgotado! Você excedeu em <span className="font-bold">{formatCurrency(Math.abs(budget.remaining))}</span>.</p>
          )}
        </div>
      </div>
    </div>
  );
}