import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { calculateBudgetStatus, getPacingColor, isInRange, monthRangeStrings } from '../../lib/calculations';
import { GlassCard } from '../shared/GlassCard';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { ROUTES } from '../../lib/constants';

function ProgressRing({
  percent,
  color,
  size = 64,
  strokeWidth = 6,
}: {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--divider)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
        style={{ opacity: 0.9 }}
      />
    </svg>
  );
}

export function BudgetProgressRings() {
  const { budgets, transactions, categories } = useBudgetContext();
  const navigate = useNavigate();

  const currentMonthTxs = useMemo(() => {
    const range = monthRangeStrings(new Date());
    return transactions.filter((tx) => isInRange(tx.date, range.start, range.end));
  }, [transactions]);

  const activeBudgets = useMemo(() => {
    const now = new Date();
    return budgets
      .filter((b) => b.isActive)
      .map((b) => ({
        status: calculateBudgetStatus(b, currentMonthTxs, now),
        category: categories.find((c) => c.id === b.categoryId),
      }));
  }, [budgets, currentMonthTxs, categories]);

  return (
    <GlassCard className="animate-fade-in-up stagger-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Budget Progress
        </h3>
        <button
          onClick={() => navigate(ROUTES.BUDGETS)}
          className="text-sm text-[var(--accent-primary)] hover:underline cursor-pointer"
        >
          Manage
        </button>
      </div>

      {activeBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Wallet size={32} strokeWidth={1} className="text-[var(--text-muted)] opacity-30 mb-2" />
          <p className="text-sm text-[var(--text-muted)]">No budgets set</p>
          <p className="text-xs text-[var(--text-muted)] opacity-60 mt-0.5">Set limits to track spending</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-2">
          {activeBudgets.map(({ status, category }) => (
            <div key={status.budget.id} className="flex flex-col items-center gap-2.5 min-w-[80px]">
              <div className="relative">
                <ProgressRing
                  percent={status.percentUsed}
                  color={getPacingColor(status.pacing)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {Math.round(status.percentUsed)}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] text-center truncate max-w-[80px] font-medium">
                {category?.name || 'Unknown'}
              </span>
              <CurrencyDisplay
                amount={status.remaining}
                className="text-[10px] text-[var(--text-muted)]"
              />
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
