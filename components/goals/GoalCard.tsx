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
  
  const progressColor = isCompleted ? 'bg-green-500' : isExpired ? 'bg-red-500' : 'bg-blue-500';
  const textColor = isCompleted ? 'text-green-600' : isExpired ? 'text-red-600' : 'text-blue-600';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{goal.name}</h3>
          <p className="text-sm text-gray-500">
            Prazo: {formatDatePtBR(goal.deadline)}
          </p>
        </div>
        <div className="flex gap-2">
          {onAddAmount && !isCompleted && !isExpired && (
            <button
              onClick={() => onAddAmount(goal.id)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Adicionar valor
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal.id)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
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
            <span className="text-gray-600">Progresso</span>
            <span className={`font-bold ${textColor}`}>
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-300`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">0</span>
            <span className="text-gray-500">{progress}%</span>
            <span className="text-gray-500">{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-700">Arrecadado</p>
            <p className="font-bold text-lg">{formatCurrency(goal.currentAmount)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-green-700">Falta</p>
            <p className="font-bold text-lg">{formatCurrency(Math.max(0, remaining))}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 p-3 rounded">
            <p className="text-sm text-purple-700">Dias restantes</p>
            <p className="font-bold text-lg">{daysRemaining}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm text-yellow-700">Status</p>
            <p className="font-bold text-lg">
              {isCompleted ? 'Concluída' : isExpired ? 'Expirada' : 'Em andamento'}
            </p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {isCompleted ? (
            <p className="text-green-600">🎉 Meta concluída! Você atingiu o objetivo.</p>
          ) : isExpired ? (
            <p className="text-red-600">⏰ Prazo expirado. Você precisa ajustar sua meta.</p>
          ) : (
            <p>
              Você precisa economizar <span className="font-bold text-blue-600">{formatCurrency(remaining)}</span> em {daysRemaining} dias para atingir sua meta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}