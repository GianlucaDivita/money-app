import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import type { Transaction, Category } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { GlassSelect } from '../shared/GlassSelect';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { CategoryIcon } from '../shared/CategoryIcon';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MonthlyComparisonProps {
  transactions: Transaction[];
  categories: Category[];
}

function getMonthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
  });
}

export function MonthlyComparison({ transactions, categories }: MonthlyComparisonProps) {
  const months = useMemo(getMonthOptions, []);
  const [monthA, setMonthA] = useState(months[0].value);
  const [monthB, setMonthB] = useState(months[1]?.value || months[0].value);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  function getTxsForMonth(monthStr: string) {
    const [year, month] = monthStr.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    return transactions.filter((tx) =>
      isWithinInterval(parseISO(tx.date), { start, end })
    );
  }

  const comparison = useMemo(() => {
    const txsA = getTxsForMonth(monthA);
    const txsB = getTxsForMonth(monthB);

    const sumByCategory = (txs: Transaction[]) => {
      const map = new Map<string, number>();
      txs.filter((t) => t.type === 'expense').forEach((tx) => {
        map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
      });
      return map;
    };

    const mapA = sumByCategory(txsA);
    const mapB = sumByCategory(txsB);

    const allCatIds = new Set([...mapA.keys(), ...mapB.keys()]);

    const rows = Array.from(allCatIds).map((catId) => {
      const amtA = mapA.get(catId) || 0;
      const amtB = mapB.get(catId) || 0;
      const delta = amtA - amtB;
      const percentChange = amtB > 0 ? ((amtA - amtB) / amtB) * 100 : amtA > 0 ? 100 : 0;
      return { catId, amtA, amtB, delta, percentChange };
    });

    rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    const totalA = txsA.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalB = txsB.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return { rows, totalA, totalB };
  }, [transactions, monthA, monthB]);

  return (
    <GlassCard className="animate-fade-in-up stagger-3">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Month Comparison
      </h3>

      <div className="flex gap-3 mb-5">
        <GlassSelect value={monthA} onChange={(e) => setMonthA(e.target.value)}>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </GlassSelect>
        <span className="self-center text-xs text-[var(--text-muted)]">vs</span>
        <GlassSelect value={monthB} onChange={(e) => setMonthB(e.target.value)}>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </GlassSelect>
      </div>

      {comparison.rows.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-4 text-center">
          No data for selected months
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {/* Header */}
          <div className="flex items-center text-[10px] text-[var(--text-muted)] pb-2 border-b border-[var(--divider)]">
            <span className="flex-1">Category</span>
            <span className="w-20 text-right">{format(parseISO(monthA + '-01'), 'MMM')}</span>
            <span className="w-20 text-right">{format(parseISO(monthB + '-01'), 'MMM')}</span>
            <span className="w-20 text-right">Change</span>
          </div>

          {comparison.rows.map(({ catId, amtA, amtB, delta, percentChange }) => {
            const cat = categoryMap.get(catId);
            return (
              <div key={catId} className="flex items-center text-xs py-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CategoryIcon icon={cat?.icon || 'circle-dot'} color={cat?.color || '#888'} size="sm" />
                  <span className="truncate text-[var(--text-primary)]">{cat?.name || 'Unknown'}</span>
                </div>
                <CurrencyDisplay amount={amtA} className="w-20 text-right text-[var(--text-secondary)]" />
                <CurrencyDisplay amount={amtB} className="w-20 text-right text-[var(--text-secondary)]" />
                <div className={`w-20 flex items-center justify-end gap-0.5 ${
                  delta > 0 ? 'text-[var(--accent-expense)]' : delta < 0 ? 'text-[var(--accent-income)]' : 'text-[var(--text-muted)]'
                }`}>
                  {delta > 0 ? <ArrowUp size={10} /> : delta < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
                  {Math.abs(percentChange).toFixed(0)}%
                </div>
              </div>
            );
          })}

          {/* Totals */}
          <div className="flex items-center text-xs pt-2 mt-1 border-t border-[var(--divider)] font-semibold">
            <span className="flex-1 text-[var(--text-primary)]">Total</span>
            <CurrencyDisplay amount={comparison.totalA} className="w-20 text-right text-[var(--text-primary)]" />
            <CurrencyDisplay amount={comparison.totalB} className="w-20 text-right text-[var(--text-primary)]" />
            <div className={`w-20 flex items-center justify-end gap-0.5 ${
              comparison.totalA > comparison.totalB ? 'text-[var(--accent-expense)]' : 'text-[var(--accent-income)]'
            }`}>
              {comparison.totalA > comparison.totalB ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              <CurrencyDisplay amount={Math.abs(comparison.totalA - comparison.totalB)} className="text-xs" />
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
