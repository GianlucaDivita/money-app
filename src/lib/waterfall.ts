import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import type { Transaction, Category } from '../types';
import { getEffectiveCategories } from './calculations';

export interface WaterfallBar {
  name: string;
  start: number;
  end: number;
  value: number;
  type: 'income' | 'expense' | 'net';
  color: string;
}

export function buildWaterfallData(
  transactions: Transaction[],
  categories: Category[],
  now: Date = new Date()
): WaterfallBar[] {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const catMap = new Map(categories.map(c => [c.id, c]));

  const monthTxs = transactions.filter(tx =>
    isWithinInterval(parseISO(tx.date), { start: monthStart, end: monthEnd })
  );

  // Group income by category
  const incomeByCat = new Map<string, number>();
  monthTxs.filter(t => t.type === 'income').forEach(tx => {
    for (const part of getEffectiveCategories(tx)) {
      incomeByCat.set(part.categoryId, (incomeByCat.get(part.categoryId) || 0) + part.amount);
    }
  });

  // Group expenses by category
  const expenseByCat = new Map<string, number>();
  monthTxs.filter(t => t.type === 'expense').forEach(tx => {
    for (const part of getEffectiveCategories(tx)) {
      expenseByCat.set(part.categoryId, (expenseByCat.get(part.categoryId) || 0) + part.amount);
    }
  });

  const bars: WaterfallBar[] = [];
  let running = 0;

  // Income bars (positive, going up)
  for (const [catId, amount] of [...incomeByCat.entries()].sort((a, b) => b[1] - a[1])) {
    const cat = catMap.get(catId);
    bars.push({
      name: cat?.name || 'Income',
      start: running,
      end: running + amount,
      value: amount,
      type: 'income',
      color: 'var(--accent-income)',
    });
    running += amount;
  }

  // Expense bars (negative, going down)
  for (const [catId, amount] of [...expenseByCat.entries()].sort((a, b) => b[1] - a[1])) {
    const cat = catMap.get(catId);
    bars.push({
      name: cat?.name || 'Expense',
      start: running,
      end: running - amount,
      value: -amount,
      type: 'expense',
      color: cat?.color || 'var(--accent-expense)',
    });
    running -= amount;
  }

  // Net balance bar
  bars.push({
    name: 'Net',
    start: 0,
    end: running,
    value: running,
    type: 'net',
    color: running >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)',
  });

  return bars;
}
