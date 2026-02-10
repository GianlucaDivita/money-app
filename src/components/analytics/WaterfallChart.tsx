import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Transaction, Category } from '../../types';
import { buildWaterfallData } from '../../lib/waterfall';
import { GlassCard } from '../shared/GlassCard';

interface WaterfallChartProps {
  transactions: Transaction[];
  categories: Category[];
}

interface BarData {
  name: string;
  invisible: number;
  visible: number;
  value: number;
  color: string;
  type: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: BarData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-sm px-3 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-primary)]">{d.name}</p>
      <p style={{ color: d.color }}>
        {d.value >= 0 ? '+' : ''}${Math.abs(d.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

export function WaterfallChart({ transactions, categories }: WaterfallChartProps) {
  const data = useMemo((): BarData[] => {
    const bars = buildWaterfallData(transactions, categories);
    return bars.map(b => ({
      name: b.name,
      invisible: Math.min(b.start, b.end),
      visible: Math.abs(b.value),
      value: b.value,
      color: b.color,
      type: b.type,
    }));
  }, [transactions, categories]);

  if (data.length <= 1) return null;

  return (
    <GlassCard className="animate-fade-in-up stagger-5">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Cash Flow Waterfall
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="invisible" stackId="stack" fill="transparent" />
            <Bar dataKey="visible" stackId="stack" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
