import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySummary, Category } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { PieChart as PieChartIcon } from 'lucide-react';

interface SpendingPieChartProps {
  data: CategorySummary[];
  categories: Category[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategorySummary & { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="glass-sm px-3 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-primary)]">{item.categoryName}</p>
      <CurrencyDisplay amount={item.total} className="text-[var(--text-secondary)]" />
      <p className="text-[var(--text-muted)]">{item.percentage.toFixed(1)}%</p>
    </div>
  );
}

export const SpendingPieChart = memo(function SpendingPieChart({ data, categories }: SpendingPieChartProps) {
  const chartData = data.map((d) => {
    const cat = categories.find((c) => c.id === d.categoryId);
    return { ...d, color: cat?.color || '#888' };
  });

  return (
    <GlassCard className="animate-fade-in-up stagger-2">
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-6">
        Spending by Category
      </h3>
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[220px] text-[var(--text-muted)]">
          <PieChartIcon size={40} strokeWidth={1} className="mb-3 opacity-30" />
          <p className="text-sm">No expenses this month</p>
          <p className="text-xs mt-1 opacity-60">Add a transaction to see the breakdown</p>
        </div>
      ) : (
        <>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="total"
                  animationBegin={0}
                  animationDuration={800}
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-5 pt-5 border-t border-[var(--divider)]">
            {chartData.slice(0, 5).map((item) => (
              <div key={item.categoryId} className="flex items-center gap-2.5 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[var(--text-secondary)]">{item.categoryName}</span>
                <span className="text-[var(--text-muted)] font-mono">{item.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
});
