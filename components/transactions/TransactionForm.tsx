'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseCurrencyToCents, formatCurrency } from '@/lib/validation';

interface TransactionFormProps {
  initialData?: {
    id?: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    paymentMethodId?: string;
    status: 'PAID' | 'PENDING';
    notes?: string;
  };
  paymentMethods?: Array<{ id: string; name: string }>;
}

export default function TransactionForm({ initialData, paymentMethods: propPaymentMethods = [] }: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedPaymentMethods, setFetchedPaymentMethods] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchingPaymentMethods, setFetchingPaymentMethods] = useState(false);
  
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount ? formatCurrency(initialData.amount).replace('R$', '').trim() : '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    category: initialData?.category || '',
    type: initialData?.type || 'EXPENSE',
    paymentMethodId: initialData?.paymentMethodId || '',
    status: initialData?.status || 'PAID',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    if (!formData.date && !initialData?.date) {
      setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [initialData?.date]);

  // Fetch payment methods if not provided via props
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (propPaymentMethods.length > 0) {
        setFetchedPaymentMethods(propPaymentMethods);
        return;
      }
      
      try {
        setFetchingPaymentMethods(true);
        const response = await fetch('/api/payment-methods');
        if (!response.ok) throw new Error('Failed to fetch payment methods');
        const data = await response.json();
        setFetchedPaymentMethods(data);
      } catch (err) {
        console.error('Error fetching payment methods:', err);
      } finally {
        setFetchingPaymentMethods(false);
      }
    };
    
    fetchPaymentMethods();
  }, [propPaymentMethods]);
  
  const paymentMethods = propPaymentMethods.length > 0 ? propPaymentMethods : fetchedPaymentMethods;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convert amount to cents
      const amountInCents = parseCurrencyToCents(formData.amount);
      
      const payload = {
        ...formData,
        amount: amountInCents,
        date: new Date(formData.date).toISOString(),
        // Remove empty string paymentMethodId
        ...(formData.paymentMethodId ? { paymentMethodId: formData.paymentMethodId } : {}),
      };

      const url = initialData?.id ? `/api/transactions/${initialData.id}` : '/api/transactions';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar transação');
      }

      router.push('/transactions');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonCategories = [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer',
    'Compras', 'Salário', 'Investimentos', 'Outros'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Categoria *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Selecione...</option>
            {commonCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ou digite uma categoria personalizada"
            className="mt-2 w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Descrição *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Ex: Supermercado"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Valor (R$) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Data *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Método de pagamento
          </label>
          <select
            name="paymentMethodId"
            value={formData.paymentMethodId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            disabled={fetchingPaymentMethods}
          >
            <option value="">Nenhum</option>
            {fetchingPaymentMethods ? (
              <option>Carregando...</option>
            ) : (
              paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="PAID">Pago</option>
            <option value="PENDING">Pendente</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Observações
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="Notas adicionais..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : initialData?.id ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}