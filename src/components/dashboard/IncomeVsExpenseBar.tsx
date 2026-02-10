import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard } from '../shared/GlassCard';

interface MonthlyData {
  period: string;
  income: number;
  expenses: number;
}

interface IncomeVsExpenseBarProps {
  data: MonthlyData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-sm px-3 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={p.dataKey === 'income' ? 'text-[var(--accent-income)]' : 'text-[var(--accent-expense)]'}>
          {p.dataKey === 'income' ? 'Income' : 'Expenses'}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export const IncomeVsExpenseBar = memo(function IncomeVsExpenseBar({ data }: IncomeVsExpenseBarProps) {
  return (
    <GlassCard className="animate-fade-in-up stagger-3">
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-6">
        Income vs Expenses
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} barSize={20}>
            <CartesianGrid vertical={false} stroke="var(--divider)" strokeDasharray="4 4" />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="income"
              fill="var(--accent-income)"
              radius={[6, 6, 0, 0]}
              animationBegin={0}
              animationDuration={600}
            />
            <Bar
              dataKey="expenses"
              fill="var(--accent-expense)"
              radius={[6, 6, 0, 0]}
              animationBegin={100}
              animationDuration={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
});
