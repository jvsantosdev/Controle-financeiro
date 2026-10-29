'use client';

import TransactionForm from '@/components/transactions/TransactionForm';

export default function NewTransactionPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Nova Transação</h1>
        <p className="text-gray-600">Adicione uma nova entrada ou saída.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <TransactionForm />
      </div>
    </div>
  );
}