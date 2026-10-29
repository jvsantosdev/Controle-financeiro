'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/validation';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const sampleData: CategoryData[] = [
  { name: 'Alimentação', value: 150000, color: '#22c55e' },
  { name: 'Transporte', value: 120000, color: '#3b82f6' },
  { name: 'Moradia', value: 200000, color: '#8b5cf6' },
  { name: 'Saúde', value: 80000, color: '#ef4444' },
  { name: 'Lazer', value: 70000, color: '#f59e0b' },
  { name: 'Outros', value: 60000, color: '#6b7280' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategoryData }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-bold">{data.name}</p>
        <p className="text-sm" style={{ color: data.color }}>
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryDistributionChart() {
  const total = sampleData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4">Distribuição por categoria (este mês)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sampleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${Math.round((entry.value / total) * 100)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {sampleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {sampleData.map((item) => (
          <div key={item.name} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{item.name}</span>
            <span className="ml-auto font-medium">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}