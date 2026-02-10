import { useMemo } from 'react';
import { Store } from 'lucide-react';
import type { Transaction } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { EmptyState } from '../shared/EmptyState';

interface TopMerchantsProps {
  transactions: Transaction[];
}

interface MerchantSummary {
  name: string;
  total: number;
  count: number;
  avgTransaction: number;
}

export function TopMerchants({ transactions }: TopMerchantsProps) {
  const merchants = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();

    for (const tx of transactions) {
      if (tx.type !== 'expense' || !tx.merchant) continue;
      const key = tx.merchant.toLowerCase().trim();
      const existing = map.get(key) || { total: 0, count: 0 };
      map.set(key, { total: existing.total + tx.amount, count: existing.count + 1 });
    }

    const results: MerchantSummary[] = [];
    for (const [name, data] of map) {
      results.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        total: data.total,
        count: data.count,
        avgTransaction: data.total / data.count,
      });
    }

    return results.sort((a, b) => b.total - a.total).slice(0, 10);
  }, [transactions]);

  const maxTotal = merchants[0]?.total || 1;

  return (
    <GlassCard>
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-6">
        Top Merchants
      </h3>

      {merchants.length === 0 ? (
        <EmptyState
          icon={<Store size={36} />}
          title="No merchant data"
          description="Add merchants to transactions to see your top spending destinations."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {merchants.map((m, i) => (
            <div key={m.name} className="flex items-center gap-3.5">
              <span className="text-xs font-mono text-[var(--text-muted)] w-5 text-right shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {m.name}
                  </span>
                  <CurrencyDisplay
                    amount={m.total}
                    className="text-sm font-mono font-semibold text-[var(--accent-expense)] shrink-0 ml-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--divider)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-expense)] to-[var(--accent-warning)] transition-all duration-500"
                      style={{ width: `${(m.total / maxTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {m.count} txn{m.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
