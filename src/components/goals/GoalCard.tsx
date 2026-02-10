import { differenceInDays, parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import type { SavingsGoal } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { CategoryIcon } from '../shared/CategoryIcon';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percent = goal.targetAmount > 0
    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
    : 0;

  const daysLeft = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null;

  return (
    <GlassCard className="group">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <CategoryIcon icon={goal.icon} color={goal.color} size="md" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{goal.name}</p>
            {daysLeft !== null && (
              <p className="text-xs text-[var(--text-muted)]">
                {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-expense)] transition-colors cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-baseline justify-between mb-4">
        <CurrencyDisplay amount={goal.currentAmount} className="text-lg font-semibold text-[var(--text-primary)]" />
        <span className="text-xs text-[var(--text-muted)]">
          of <CurrencyDisplay amount={goal.targetAmount} className="text-xs" />
        </span>
      </div>

      <div className="h-2.5 rounded-full overflow-hidden bg-[var(--divider)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: goal.color,
          }}
        />
      </div>

      <div className="flex justify-between mt-4">
        <span className="text-xs font-medium" style={{ color: goal.color }}>
          {percent.toFixed(0)}%
        </span>
        <CurrencyDisplay
          amount={goal.targetAmount - goal.currentAmount}
          className="text-xs text-[var(--text-muted)]"
        />
      </div>
    </GlassCard>
  );
}
