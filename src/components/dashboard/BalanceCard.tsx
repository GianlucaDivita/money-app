import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';

interface BalanceCardProps {
  income: number;
  expenses: number;
  balance: number;
}

export const BalanceCard = memo(function BalanceCard({ income, expenses, balance }: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <GlassCard className="animate-fade-in-up stagger-1 relative overflow-hidden" role="region" aria-label="Net balance summary">
      {/* Subtle accent gradient in background — uses radial-gradient instead of
           filter:blur to avoid GPU compositing layers in Safari fullscreen */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-[0.1] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${isPositive ? 'var(--accent-income)' : 'var(--accent-expense)'} 0%, transparent 70%)` }}
      />

      <div className="flex flex-col gap-5 relative">
        {/* Net balance */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Net Balance
          </p>
          <div className="flex items-center gap-3">
            <CurrencyDisplay
              amount={balance}
              animated
              className={`text-4xl font-display font-bold tracking-tight ${
                isPositive ? 'text-[var(--accent-income)]' : 'text-[var(--accent-expense)]'
              }`}
            />
            <div
              className={`p-2.5 rounded-xl ${
                isPositive ? 'bg-[var(--accent-income)]/10' : 'bg-[var(--accent-expense)]/10'
              }`}
            >
              {balance > 0 ? (
                <TrendingUp size={20} className="text-[var(--accent-income)]" />
              ) : balance < 0 ? (
                <TrendingDown size={20} className="text-[var(--accent-expense)]" />
              ) : (
                <Minus size={20} className="text-[var(--text-muted)]" />
              )}
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1.5">This month</p>
        </div>

        {/* Income / Expenses breakdown */}
        <div className="flex gap-8 pt-5 border-t border-[var(--divider)]">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-income)]" />
              <p className="text-sm text-[var(--text-muted)]">Income</p>
            </div>
            <div className="flex items-center gap-2">
              <CurrencyDisplay
                amount={income}
                animated
                className="text-xl font-semibold text-[var(--text-primary)]"
              />
              <ArrowUpRight size={14} className="text-[var(--accent-income)]" />
            </div>
          </div>
          <div className="w-px bg-[var(--divider)]" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-expense)]" />
              <p className="text-sm text-[var(--text-muted)]">Expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <CurrencyDisplay
                amount={expenses}
                animated
                className="text-xl font-semibold text-[var(--text-primary)]"
              />
              <ArrowDownRight size={14} className="text-[var(--accent-expense)]" />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
});
