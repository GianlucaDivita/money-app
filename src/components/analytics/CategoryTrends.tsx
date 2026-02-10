import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import type { Transaction, Category } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { GlassSelect } from '../shared/GlassSelect';

interface CategoryTrendsProps {
  transactions: Transaction[];
  categories: Category[];
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

export function CategoryTrends({ transactions, categories }: CategoryTrendsProps) {
  // Find expense categories with transactions
  const expenseCategories = useMemo(() => {
    const catIds = new Set(
      transactions.filter(t => t.type === 'expense').map(t => t.categoryId)
    );
    return categories.filter(c => catIds.has(c.id));
  }, [transactions, categories]);

  const [selectedCatId, setSelectedCatId] = useState('');

  // Default to highest-spend category
  const activeCatId = useMemo(() => {
    if (selectedCatId && expenseCategories.some(c => c.id === selectedCatId)) {
      return selectedCatId;
    }
    if (expenseCategories.length === 0) return '';
    // Find highest-spend in current month
    const totals = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + t.amount);
    });
    let maxCat = expenseCategories[0].id;
    let maxAmt = 0;
    for (const [id, amt] of totals) {
      if (amt > maxAmt) { maxAmt = amt; maxCat = id; }
    }
    return maxCat;
  }, [selectedCatId, expenseCategories, transactions]);

  const selectedCat = categories.find(c => c.id === activeCatId);
  const catColor = selectedCat?.color || '#6366f1';

  // Build 12-month trend data
  const { data, average } = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const total = transactions
        .filter(
          t => t.type === 'expense' &&
          t.categoryId === activeCatId &&
          isWithinInterval(parseISO(t.date), { start, end })
        )
        .reduce((s, t) => s + t.amount, 0);
      return { month: format(d, 'MMM'), total };
    });

    const nonZero = months.filter(m => m.total > 0);
    const avg = nonZero.length > 0
      ? nonZero.reduce((s, m) => s + m.total, 0) / nonZero.length
      : 0;

    return { data: months, average: Math.round(avg) };
  }, [transactions, activeCatId]);

  // Generate a unique gradient id for this component
  const gradientId = `catTrendGradient-${activeCatId}`;

  if (expenseCategories.length === 0) return null;

  return (
    <GlassCard className="animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          Category Trends (12 months)
        </h3>
        <div className="w-44">
          <GlassSelect
            value={activeCatId}
            onChange={e => setSelectedCatId(e.target.value)}
          >
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </GlassSelect>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={catColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={catColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--divider)" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            {average > 0 && (
              <ReferenceLine
                y={average}
                stroke="var(--text-muted)"
                strokeDasharray="6 4"
                strokeOpacity={0.5}
                label={{
                  value: `Avg $${average}`,
                  position: 'insideTopRight',
                  fill: 'var(--text-muted)',
                  fontSize: 10,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="total"
              stroke={catColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationBegin={0}
              animationDuration={1000}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
