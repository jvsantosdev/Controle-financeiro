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
  onSubmit: (data: { name: string; targetAmount: number; currentAmount: number; deadline: string }) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function GoalForm({ initialData, onSubmit, onCancel, isEditing = false }: GoalFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(
    initialData?.targetAmount ? formatCurrency(initialData.targetAmount).replace('R$', '').trim() : ''
  );
  const [currentAmount, setCurrentAmount] = useState(
    initialData?.currentAmount ? formatCurrency(initialData.currentAmount).replace('R$', '').trim() : ''
  );
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError('Digite um nome para a meta');
      return;
    }
    
    const targetInCents = parseCurrencyToCents(targetAmount);
    if (!targetAmount || isNaN(targetInCents) || targetInCents <= 0) {
      setError('Insira um valor alvo válido');
      return;
    }
    
    if (!deadline) {
      setError('Selecione uma data limite');
      return;
    }
    
    const currentInCents = currentAmount ? parseCurrencyToCents(currentAmount) : 0;
    if (currentAmount && isNaN(currentInCents)) {
      setError('Valor atual inválido');
      return;
    }
    
    if (currentInCents > targetInCents) {
      setError('O valor atual não pode ser maior que o valor alvo');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Nome da meta *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Viagem para Europa, Nova moto, Reserva de emergência"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Valor alvo (R$) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">R$</span>
            <input
              type="text"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Valor atual (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">R$</span>
            <input
              type="text"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Data limite *
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Data até quando você quer atingir essa meta
        </p>
      </div>
      
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : isEditing ? 'Atualizar meta' : 'Criar meta'}
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