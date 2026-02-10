import { memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard } from '../shared/GlassCard';

interface DailyData {
  date: string;
  total: number;
}

interface TrendLineChartProps {
  data: DailyData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-sm px-3 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="text-[var(--accent-expense)]">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export const TrendLineChart = memo(function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <GlassCard className="animate-fade-in-up stagger-4">
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-6">
        Daily Spending (30 days)
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-expense)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--accent-expense)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--divider)" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--accent-expense)"
              strokeWidth={2}
              fill="url(#spendingGradient)"
              animationBegin={0}
              animationDuration={1000}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
});
