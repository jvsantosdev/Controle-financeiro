'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      if (!response.ok) throw new Error('Failed to delete');
      
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
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Métodos de Pagamento</h1>
          <p className="text-gray-600">Gerencie seus cartões e outras formas de pagamento.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Adicionar método
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Editar método' : 'Novo método de pagamento'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
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
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Nubank, Itaú"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Últimos 4 dígitos</label>
                <input
                  type="text"
                  name="lastFourDigits"
                  value={formData.lastFourDigits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              
              {formData.type === 'CREDIT_CARD' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dia de fechamento</label>
                    <input
                      type="number"
                      name="closingDay"
                      value={formData.closingDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="1-31"
                      min="1"
                      max="31"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dia de vencimento</label>
                    <input
                      type="number"
                      name="dueDay"
                      value={formData.dueDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="1-31"
                      min="1"
                      max="31"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    type: 'CREDIT_CARD',
                    name: '',
                    lastFourDigits: '',
                    closingDay: '',
                    dueDay: '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment methods list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700">{error}</div>
        ) : paymentMethods.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum método de pagamento cadastrado.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paymentMethods.map((method: any) => (
              <div key={method.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`px-3 py-1 rounded-md text-sm ${
                        method.type === 'CREDIT_CARD' ? 'bg-purple-100 text-purple-800' :
                        method.type === 'DEBIT_CARD' ? 'bg-blue-100 text-blue-800' :
                        method.type === 'PIX' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {typeLabels[method.type as keyof typeof typeLabels]}
                      </div>
                      <h3 className="font-medium">{method.name}</h3>
                      {method.lastFourDigits && (
                        <span className="text-gray-600">•••• {method.lastFourDigits}</span>
                      )}
                    </div>
                    
                    {method.type === 'CREDIT_CARD' && (
                      <div className="mt-2 text-sm text-gray-600">
                        {method.closingDay && `Fecha dia ${method.closingDay}`}
                        {method.closingDay && method.dueDay && ' • '}
                        {method.dueDay && `Vence dia ${method.dueDay}`}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEdit(method)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}