'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TransactionForm from '@/components/transactions/TransactionForm';

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const transactionResponse = await fetch(`/api/transactions/${id}`);
        if (!transactionResponse.ok) {
          throw new Error('Transação não encontrada');
        }
        const transactionData = await transactionResponse.json();
        
        // Fetch payment methods (placeholder - create API later)
        // For now, empty array
        setPaymentMethods([]);
        
        setTransaction(transactionData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'Transação não encontrada'}
        </div>
        <button
          onClick={() => router.push('/transactions')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Editar Transação</h1>
        <p className="text-gray-600">Atualize os dados da transação.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <TransactionForm 
          initialData={transaction}
          paymentMethods={paymentMethods}
        />
      </div>
    </div>
  );
}