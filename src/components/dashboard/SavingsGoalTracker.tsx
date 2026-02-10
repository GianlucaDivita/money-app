import { useNavigate } from 'react-router-dom';
import { Target, Plus } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { GlassCard } from '../shared/GlassCard';
import { GlassButton } from '../shared/GlassButton';
import { CategoryIcon } from '../shared/CategoryIcon';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { ROUTES } from '../../lib/constants';

export function SavingsGoalTracker() {
  const { goals } = useBudgetContext();
  const navigate = useNavigate();

  const topGoals = goals.slice(0, 3);

  return (
    <GlassCard className="animate-fade-in-up stagger-6 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          Savings Goals
        </h3>
        {topGoals.length > 0 && (
          <button
            onClick={() => navigate(ROUTES.GOALS)}
            className="text-xs text-[var(--accent-primary)] hover:underline cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {topGoals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-4">
            <Target size={24} className="text-[var(--accent-primary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            Set a savings goal
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-5 max-w-[180px]">
            Track progress toward vacations, emergency funds, or big purchases.
          </p>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate(ROUTES.GOALS)}
          >
            Create Goal
          </GlassButton>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {topGoals.map((goal) => {
            const percent = goal.targetAmount > 0
              ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              : 0;

            return (
              <div key={goal.id} className="flex items-center gap-3">
                <CategoryIcon icon={goal.icon} color={goal.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {goal.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[var(--divider)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <CurrencyDisplay amount={goal.currentAmount} className="text-[10px] text-[var(--text-muted)]" />
                    <CurrencyDisplay amount={goal.targetAmount} className="text-[10px] text-[var(--text-muted)]" />
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
