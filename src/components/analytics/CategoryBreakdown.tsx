import type { CategorySummary, Category } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { CategoryIcon } from '../shared/CategoryIcon';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CategoryBreakdownProps {
  data: CategorySummary[];
  categories: Category[];
}

export function CategoryBreakdown({ data, categories }: CategoryBreakdownProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <GlassCard className="animate-fade-in-up stagger-1">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Category Breakdown
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-8 text-center">
          No expenses this month
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {data.map((item) => {
            const cat = categoryMap.get(item.categoryId);
            return (
              <div key={item.categoryId} className="flex items-center gap-3.5">
                <CategoryIcon
                  icon={cat?.icon || 'circle-dot'}
                  color={cat?.color || '#888'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {item.categoryName}
                    </span>
                    <CurrencyDisplay
                      amount={item.total}
                      className="text-sm font-semibold text-[var(--text-primary)]"
                    />
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden bg-[var(--divider)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: cat?.color || '#888',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {item.count} transaction{item.count !== 1 ? 's' : ''} · avg{' '}
                      <CurrencyDisplay amount={item.averageTransaction} className="text-[10px]" />
                    </span>
                    {item.trend !== 0 && (
                      <span
                        className={`text-[10px] flex items-center gap-0.5 ${
                          item.trend > 0 ? 'text-[var(--accent-expense)]' : 'text-[var(--accent-income)]'
                        }`}
                      >
                        {item.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(item.trend).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
