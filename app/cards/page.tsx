'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function CardsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'CREDIT_CARD',
    name: '',
    lastFourDigits: '',
    closingDay: '',
    dueDay: '',
  });

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-methods');
      if (!response.ok) throw new Error('Falha ao carregar métodos de pagamento');

      const data = await response.json();
      setPaymentMethods(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        closingDay: formData.closingDay ? parseInt(formData.closingDay) : undefined,
        dueDay: formData.dueDay ? parseInt(formData.dueDay) : undefined,
      };

      const url = editingId ? `/api/payment-methods/${editingId}` : '/api/payment-methods';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        type: 'CREDIT_CARD',
        name: '',
        lastFourDigits: '',
        closingDay: '',
        dueDay: '',
      });

      fetchPaymentMethods();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleEdit = (method: any) => {
    setFormData({
      type: method.type,
      name: method.name,
      lastFourDigits: method.lastFourDigits || '',
      closingDay: method.closingDay?.toString() || '',
      dueDay: method.dueDay?.toString() || '',
    });
    setEditingId(method.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este método de pagamento?')) return;

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir');

      fetchPaymentMethods();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const typeLabels = {
    CREDIT_CARD: 'Cartão de Crédito',
    DEBIT_CARD: 'Cartão de Débito',
    PIX: 'PIX',
    CASH: 'Dinheiro',
    OTHER: 'Outro',
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cartões & Formas de Pagamento
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Controle datas de fechamento e vencimento para otimizar suas faturas.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: 'CREDIT_CARD',
              name: '',
              lastFourDigits: '',
              closingDay: '',
              dueDay: '',
            });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Cartão / Método</span>
        </button>
      </div>

      {/* Form Drawer / Modal Area */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg mb-8 animate-fade-in">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingId ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Tipo *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  required
                >
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Nome ou Instituição *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  placeholder="Ex: Nubank Ultravioleta, Inter Black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Últimos 4 Dígitos
                </label>
                <input
                  type="text"
                  name="lastFourDigits"
                  value={formData.lastFourDigits}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono"
                  placeholder="4821"
                  maxLength={4}
                />
              </div>

              {formData.type === 'CREDIT_CARD' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Dia de Fechamento (1-31)
                    </label>
                    <input
                      type="number"
                      name="closingDay"
                      value={formData.closingDay}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      placeholder="Ex: 10"
                      min="1"
                      max="31"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Dia de Vencimento (1-31)
                    </label>
                    <input
                      type="number"
                      name="dueDay"
                      value={formData.dueDay}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      placeholder="Ex: 17"
                      min="1"
                      max="31"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm transition-all"
              >
                {editingId ? 'Salvar Alterações' : 'Cadastrar Método'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse h-48"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm mb-6">{error}</div>
      ) : paymentMethods.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 text-2xl flex items-center justify-center mx-auto mb-3">
            💳
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Nenhum método cadastrado
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-6">
            Adicione seus cartões de crédito, contas com PIX ou débito para vincular nas suas compras.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            Adicionar primeiro método
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method: any) => {
            const isCredit = method.type === 'CREDIT_CARD';
            return (
              <div
                key={method.id}
                className={`p-6 rounded-2xl border transition-all relative overflow-hidden group shadow-xs ${
                  isCredit
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700/80'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                        isCredit
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {typeLabels[method.type as keyof typeof typeLabels]}
                    </span>
                    <h3 className="text-lg font-bold tracking-tight">{method.name}</h3>
                  </div>
                  <div className="text-xl">
                    {isCredit ? '💳' : method.type === 'PIX' ? '⚡' : '🏦'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono mb-4">
                  <span className={isCredit ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}>
                    {method.lastFourDigits ? `•••• •••• •••• ${method.lastFourDigits}` : 'Sem número'}
                  </span>
                </div>

                {isCredit && (method.closingDay || method.dueDay) && (
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Fecha dia: <strong>{method.closingDay || '—'}</strong></span>
                    <span>Vence dia: <strong>{method.dueDay || '—'}</strong></span>
                  </div>
                )}

                <div className={`flex justify-end gap-3 pt-3 mt-3 border-t text-xs ${isCredit ? 'border-slate-700/60' : 'border-slate-100 dark:border-slate-800'}`}>
                  <button
                    onClick={() => handleEdit(method)}
                    className="font-medium text-emerald-500 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="font-medium text-rose-500 hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
