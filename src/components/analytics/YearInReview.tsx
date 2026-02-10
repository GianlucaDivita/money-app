import { useMemo, useState } from 'react';
import type { Transaction, Category } from '../../types';
import { generateYearInReview } from '../../lib/yearReview';
import { GlassModal } from '../shared/GlassModal';
import { GlassSelect } from '../shared/GlassSelect';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { CategoryIcon } from '../shared/CategoryIcon';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface YearInReviewProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
}

function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - i);
}

export function YearInReview({ isOpen, onClose, transactions, categories }: YearInReviewProps) {
  const years = useMemo(getYearOptions, []);
  const [year, setYear] = useState(years[0]);

  const data = useMemo(
    () => generateYearInReview(transactions, categories, year),
    [transactions, categories, year]
  );

  const maxMonthBar = Math.max(...data.months.map(m => Math.max(m.income, m.expenses)), 1);

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Year in Review" size="lg">
      <div className="flex flex-col gap-6">
        {/* Year selector */}
        <div className="w-32">
          <GlassSelect
            value={String(year)}
            onChange={e => setYear(Number(e.target.value))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </GlassSelect>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Total Income" amount={data.totalIncome} color="var(--accent-income)" />
          <MetricCard label="Total Expenses" amount={data.totalExpenses} color="var(--accent-expense)" />
          <MetricCard label="Net Savings" amount={data.totalNet} color={data.totalNet >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)'} />
          <MetricCard label="Avg Monthly" amount={data.avgMonthlySavings} color="var(--accent-primary)" />
        </div>

        {/* Monthly bars */}
        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Monthly Overview</h4>
          <div className="flex items-end gap-1.5 h-32">
            {data.months.map((m, i) => {
              const isBest = data.bestMonth?.month === m.month && (m.income > 0 || m.expenses > 0);
              const isWorst = data.worstMonth?.month === m.month && (m.income > 0 || m.expenses > 0);
              const barH = Math.max((m.expenses / maxMonthBar) * 100, 2);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-24">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isBest ? 'bg-[var(--accent-income)]' :
                        isWorst ? 'bg-[var(--accent-expense)]' :
                        'bg-[var(--accent-primary)]/40'
                      }`}
                      style={{ height: `${barH}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)]">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[var(--accent-income)]" /> Best
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[var(--accent-expense)]" /> Worst
            </span>
          </div>
        </div>

        {/* Category trends */}
        {data.categoryTrends.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Category Trends (H1 vs H2)</h4>
            <div className="flex flex-col gap-2">
              {data.categoryTrends.slice(0, 8).map(ct => (
                <div key={ct.categoryId} className="flex items-center gap-3 text-xs">
                  <CategoryIcon
                    icon={categories.find(c => c.id === ct.categoryId)?.icon || 'circle-dot'}
                    color={ct.color}
                    size="sm"
                  />
                  <span className="flex-1 text-[var(--text-primary)] truncate">{ct.categoryName}</span>
                  <CurrencyDisplay amount={ct.h1Total} className="w-20 text-right text-[var(--text-secondary)]" />
                  <CurrencyDisplay amount={ct.h2Total} className="w-20 text-right text-[var(--text-secondary)]" />
                  <div className={`w-16 flex items-center justify-end gap-0.5 ${
                    ct.trend === 'up' ? 'text-[var(--accent-expense)]' :
                    ct.trend === 'down' ? 'text-[var(--accent-income)]' :
                    'text-[var(--text-muted)]'
                  }`}>
                    {ct.trend === 'up' ? <TrendingUp size={12} /> :
                     ct.trend === 'down' ? <TrendingDown size={12} /> :
                     <Minus size={12} />}
                    {Math.abs(ct.percentChange).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top merchant */}
        {data.topMerchant && (
          <div className="glass-sm rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Top Merchant</p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{data.topMerchant.name}</p>
            </div>
            <CurrencyDisplay
              amount={data.topMerchant.total}
              className="text-lg font-semibold text-[var(--accent-expense)]"
            />
          </div>
        )}
      </div>
    </GlassModal>
  );
}

function MetricCard({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="glass-sm rounded-xl p-3 flex flex-col items-center text-center">
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <span className="text-xl font-mono font-bold" style={{ color }}>
        <AnimatedNumber
          value={Math.round(amount)}
          formatFn={n => `$${n.toLocaleString()}`}
        />
      </span>
    </div>
  );
}
