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

export default function TransactionForm({
  initialData,
  paymentMethods: propPaymentMethods = [],
}: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedPaymentMethods, setFetchedPaymentMethods] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [fetchingPaymentMethods, setFetchingPaymentMethods] = useState(false);

  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount
      ? formatCurrency(initialData.amount).replace('R$', '').trim()
      : '',
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : '',
    category: initialData?.category || '',
    type: initialData?.type || 'EXPENSE',
    paymentMethodId: initialData?.paymentMethodId || '',
    status: initialData?.status || 'PAID',
    notes: initialData?.notes || '',
  });

  useEffect(() => {
    if (!formData.date && !initialData?.date) {
      setFormData((prev) => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
      }));
    }
  }, [initialData?.date]);

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

  const paymentMethods =
    propPaymentMethods.length > 0 ? propPaymentMethods : fetchedPaymentMethods;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amountInCents = parseCurrencyToCents(formData.amount);

      const payload = {
        ...formData,
        amount: amountInCents,
        date: new Date(formData.date).toISOString(),
        ...(formData.paymentMethodId ? { paymentMethodId: formData.paymentMethodId } : {}),
      };

      const url = initialData?.id
        ? `/api/transactions/${initialData.id}`
        : '/api/transactions';
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
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Salário',
    'Investimentos',
    'Outros',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Type Selector (Tabs) */}
      <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-950/60 max-w-sm">
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: 'EXPENSE' }))}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            formData.type === 'EXPENSE'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: 'INCOME' }))}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            formData.type === 'INCOME'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Receita
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Descrição *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            placeholder="Ex: Supermercado, Aluguel, Salário"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Valor (R$) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">
              R$
            </span>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Categoria *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            required
          >
            <option value="">Selecione uma categoria...</option>
            {commonCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Data *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Método de Pagamento
          </label>
          <select
            name="paymentMethodId"
            value={formData.paymentMethodId}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            disabled={fetchingPaymentMethods}
          >
            <option value="">Nenhum (Dinheiro / Direto)</option>
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          >
            <option value="PAID">Pago / Concluído</option>
            <option value="PENDING">Pendente</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Observações adicionais (opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          rows={3}
          placeholder="Ex: Parcela 2 de 5, compra reembolsável..."
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
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
            ? 'Salvando...'
            : initialData?.id
            ? 'Atualizar lançamento'
            : 'Adicionar lançamento'}
        </button>
      </div>
    </form>
  );
}
