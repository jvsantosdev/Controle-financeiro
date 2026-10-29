'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/validation';

interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
}

const sampleData: IncomeExpenseData[] = [
  { month: 'Jan', income: 450000, expenses: 320000 },
  { month: 'Fev', income: 480000, expenses: 350000 },
  { month: 'Mar', income: 520000, expenses: 380000 },
  { month: 'Abr', income: 470000, expenses: 330000 },
  { month: 'Mai', income: 500000, expenses: 370000 },
  { month: 'Jun', income: 530000, expenses: 400000 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.name === 'income' ? '#22c55e' : '#ef4444' }}>
            {entry.name === 'income' ? 'Receitas:' : 'Despesas:'} {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4">Receitas vs Despesas (últimos 6 meses)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sampleData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="income" 
              name="Receitas" 
              fill="#22c55e" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="expenses" 
              name="Despesas" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Comparativo mensal de receitas e despesas
      </p>
    </div>
  );
}