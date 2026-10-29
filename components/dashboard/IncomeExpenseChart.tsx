'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-sm text-xs">
        <p className="font-bold mb-2 text-slate-300">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className={entry.dataKey === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                {entry.dataKey === 'income' ? 'Receitas' : 'Despesas'}:
              </span>
              <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseChart() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Receitas vs Despesas
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Fluxo comparativo dos últimos 6 meses
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Despesas</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sampleData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800/60" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-slate-400 dark:text-slate-500"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
              className="text-slate-400 dark:text-slate-500"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
