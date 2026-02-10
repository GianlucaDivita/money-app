import { useMemo, memo } from 'react';
import { Flame, Ban } from 'lucide-react';
import type { Transaction } from '../../types';
import { calculateStreaks } from '../../lib/insights';
import { GlassCard } from '../shared/GlassCard';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';

interface SpendingStreaksProps {
  transactions: Transaction[];
}

export const SpendingStreaks = memo(function SpendingStreaks({ transactions }: SpendingStreaksProps) {
  const streaks = useMemo(() => calculateStreaks(transactions), [transactions]);

  return (
    <GlassCard className="animate-fade-in-up stagger-6">
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-5">
        Streaks
      </h3>
      <div className="flex flex-col gap-5">
        {/* Under-average streak */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-income)]/10 flex items-center justify-center shrink-0">
            <Flame size={22} className="text-[var(--accent-income)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-mono font-bold text-[var(--text-primary)] leading-none">
              {streaks.underAverageStreak}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">days under daily average</p>
          </div>
        </div>

        {/* No-spend streak */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0">
            <Ban size={22} className="text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-mono font-bold text-[var(--text-primary)] leading-none">
              {streaks.noSpendStreak}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">consecutive no-spend days</p>
          </div>
        </div>

        {/* Daily average */}
        <div className="pt-4 border-t border-[var(--divider)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">Daily Average (30d)</p>
          <CurrencyDisplay
            amount={streaks.dailyAverage}
            className="text-lg font-semibold text-[var(--text-primary)]"
          />
        </div>
      </div>
    </GlassCard>
  );
});
