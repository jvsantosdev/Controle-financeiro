'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/validation';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const sampleData: CategoryData[] = [
  { name: 'Alimentação', value: 150000, color: '#10b981' },
  { name: 'Transporte', value: 120000, color: '#0ea5e9' },
  { name: 'Moradia', value: 200000, color: '#6366f1' },
  { name: 'Saúde', value: 80000, color: '#f43f5e' },
  { name: 'Lazer', value: 70000, color: '#f59e0b' },
  { name: 'Outros', value: 60000, color: '#64748b' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CategoryData }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-sm text-xs">
        <p className="font-semibold text-slate-300">{data.name}</p>
        <p className="font-extrabold mt-0.5" style={{ color: data.color }}>
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
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="mb-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Gastos por categoria
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Distribuição proporcional no mês corrente
        </p>
      </div>

      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sampleData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {sampleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
            Total
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {sampleData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 dark:text-slate-400 truncate">
                {item.name}
              </span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white flex-shrink-0 pl-1">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
