import { useMemo, memo } from 'react';
import type { Transaction, Category, Budget } from '../../types';
import { generateInsights } from '../../lib/insights';
import { GlassCard } from '../shared/GlassCard';
import { CategoryIcon } from '../shared/CategoryIcon';

interface InsightCardsProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

const typeStyles = {
  warning: { bg: 'bg-[var(--accent-warning)]/10', color: 'text-[var(--accent-warning)]' },
  achievement: { bg: 'bg-[var(--accent-income)]/10', color: 'text-[var(--accent-income)]' },
  trend: { bg: 'bg-[var(--accent-primary)]/10', color: 'text-[var(--accent-primary)]' },
  tip: { bg: 'bg-[var(--accent-primary)]/10', color: 'text-[var(--accent-primary)]' },
};

export const InsightCards = memo(function InsightCards({ transactions, categories, budgets }: InsightCardsProps) {
  const insights = useMemo(
    () => generateInsights(transactions, categories, budgets),
    [transactions, categories, budgets]
  );

  if (insights.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">
        Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => {
          const style = typeStyles[insight.type];
          return (
            <GlassCard key={insight.id} compact className={`animate-fade-in-up stagger-${i + 1}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${style.bg}`}>
                  <CategoryIcon icon={insight.icon} color="currentColor" size="sm" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${style.color}`}>{insight.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{insight.description}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
});
