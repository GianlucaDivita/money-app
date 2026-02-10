import type { Category } from '../../types';
import type { BudgetStatus } from '../../lib/calculations';
import { getPacingColor, getPacingLabel } from '../../lib/calculations';
import { GlassCard } from '../shared/GlassCard';
import { CategoryIcon } from '../shared/CategoryIcon';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { Pencil, Trash2 } from 'lucide-react';

interface BudgetCardProps {
  status: BudgetStatus;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export function BudgetCard({ status, category, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, percentUsed, percentOfMonth, pacing } = status;
  const pacingColor = getPacingColor(pacing);
  const pacingLabel = getPacingLabel(pacing);
  const clampedPercent = Math.min(percentUsed, 100);

  return (
    <GlassCard className="group">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <CategoryIcon
            icon={category?.icon || 'circle-dot'}
            color={category?.color || '#888'}
            size="md"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {category?.name || 'Unknown'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {budget.period === 'monthly' ? 'Monthly' : 'Weekly'} budget
            </p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-expense)] transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Amount spent / limit */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <CurrencyDisplay
            amount={spent}
            className="text-lg font-semibold text-[var(--text-primary)]"
          />
          <span className="text-xs text-[var(--text-muted)]">
            / <CurrencyDisplay amount={budget.amount} className="text-xs" />
          </span>
        </div>
        <CurrencyDisplay
          amount={remaining}
          className="text-xs text-[var(--text-muted)]"
        />
      </div>

      {/* Dual-track progress bar */}
      <div className="relative h-3 rounded-full overflow-hidden bg-[var(--divider)]">
        {/* Budget spent fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${clampedPercent}%`,
            backgroundColor: pacingColor,
          }}
        />
        {/* Pacing marker (where you "should" be) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--text-muted)] opacity-60"
          style={{ left: `${Math.min(percentOfMonth, 100)}%` }}
        />
      </div>

      {/* Pacing label */}
      <div className="flex items-center justify-between mt-4">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            color: pacingColor,
            backgroundColor: `color-mix(in srgb, ${pacingColor} 15%, transparent)`,
          }}
        >
          {pacingLabel}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {percentUsed.toFixed(0)}% used
        </span>
      </div>
    </GlassCard>
  );
}
