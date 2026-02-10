import {
  subMonths,
  format,
  getDaysInMonth,
  eachDayOfInterval,
  subDays,
  getDay,
  parseISO,
} from 'date-fns';
import type { Transaction, Category, Budget, Insight } from '../types';
import { getEffectiveCategories, isInRange, monthRangeStrings } from './calculations';

let insightCounter = 0;
function stableId(prefix: string): string {
  return `insight-${prefix}-${++insightCounter}`;
}

export function generateInsights(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[]
): Insight[] {
  insightCounter = 0;
  const insights: Insight[] = [];
  const now = new Date();
  const curRange = monthRangeStrings(now);
  const prevRange = monthRangeStrings(subMonths(now, 1));
  const threeMonthStart = monthRangeStrings(subMonths(now, 3)).start;

  // Single pass to partition transactions
  const currentTxs: Transaction[] = [];
  const prevTxs: Transaction[] = [];
  const threeMonthTxs: Transaction[] = [];
  for (const tx of transactions) {
    if (isInRange(tx.date, curRange.start, curRange.end)) {
      currentTxs.push(tx);
      threeMonthTxs.push(tx);
    } else if (isInRange(tx.date, prevRange.start, prevRange.end)) {
      prevTxs.push(tx);
      threeMonthTxs.push(tx);
    } else if (isInRange(tx.date, threeMonthStart, curRange.end)) {
      threeMonthTxs.push(tx);
    }
  }

  // Single-pass totals for current month
  let currentIncome = 0;
  let currentExpenseTotal = 0;
  const currentExpenses: Transaction[] = [];
  for (const t of currentTxs) {
    if (t.type === 'income') currentIncome += t.amount;
    else { currentExpenseTotal += t.amount; currentExpenses.push(t); }
  }

  let prevExpenseTotal = 0;
  for (const t of prevTxs) {
    if (t.type === 'expense') prevExpenseTotal += t.amount;
  }

  // 1. Category spending anomalies (>30% above 3-month average)
  const catMap = new Map<string, Category>();
  categories.forEach((c) => catMap.set(c.id, c));

  const catAvg3m = new Map<string, number>();
  threeMonthTxs
    .filter((t) => t.type === 'expense')
    .forEach((tx) => {
      for (const part of getEffectiveCategories(tx)) {
        catAvg3m.set(part.categoryId, (catAvg3m.get(part.categoryId) || 0) + part.amount);
      }
    });
  catAvg3m.forEach((total, catId) => catAvg3m.set(catId, total / 3));

  const currentCatTotals = new Map<string, number>();
  currentExpenses.forEach((tx) => {
    for (const part of getEffectiveCategories(tx)) {
      currentCatTotals.set(part.categoryId, (currentCatTotals.get(part.categoryId) || 0) + part.amount);
    }
  });

  currentCatTotals.forEach((total, catId) => {
    const avg = catAvg3m.get(catId);
    if (avg && avg > 0) {
      const pctAbove = ((total - avg) / avg) * 100;
      if (pctAbove > 30) {
        const cat = catMap.get(catId);
        insights.push({
          id: stableId(catId),
          type: 'warning',
          title: `${cat?.name || 'Category'} spending is up`,
          description: `You've spent ${pctAbove.toFixed(0)}% more on ${cat?.name || 'this category'} compared to your 3-month average.`,
          icon: 'trending-up',
          relatedCategoryId: catId,
          priority: 1,
        });
      }
    }
  });

  // 2. Budget pacing warnings
  const dayOfMonth = now.getDate();
  const daysInMonth = getDaysInMonth(now);
  const pctOfMonth = dayOfMonth / daysInMonth;

  budgets.forEach((budget) => {
    if (!budget.isActive) return;
    const spent = currentExpenses
      .filter((tx) => tx.categoryId === budget.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    const pctUsed = spent / budget.amount;

    if (pctUsed > pctOfMonth + 0.2 && pctUsed < 1) {
      const cat = catMap.get(budget.categoryId);
      const projectedDay = Math.round(budget.amount / (spent / dayOfMonth));
      insights.push({
        id: stableId(`pace-${budget.categoryId}`),
        type: 'warning',
        title: `${cat?.name || 'Budget'} pace warning`,
        description: `You're on track to exceed your ${cat?.name || ''} budget by the ${ordinal(projectedDay)}.`,
        icon: 'alert-triangle',
        relatedCategoryId: budget.categoryId,
        priority: 2,
      });
    }
  });

  // 3. Savings improvement
  const prevIncome = prevTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevNetSavings = prevIncome - prevExpenseTotal;
  const currentNetSavings = currentIncome - currentExpenseTotal;

  if (currentNetSavings > prevNetSavings && prevNetSavings > 0) {
    const diff = currentNetSavings - prevNetSavings;
    insights.push({
      id: stableId('savings-improved'),
      type: 'achievement',
      title: 'Savings improved!',
      description: `You've saved $${diff.toFixed(0)} more than last month. Great progress!`,
      icon: 'trophy',
      priority: 3,
    });
  }

  // 4. Day-of-week spending pattern
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  threeMonthTxs
    .filter((t) => t.type === 'expense')
    .forEach((tx) => {
      const d = getDay(parseISO(tx.date));
      dayTotals[d] += tx.amount;
      dayCounts[d]++;
    });

  let maxDay = 0;
  let maxDayAvg = 0;
  dayTotals.forEach((total, i) => {
    const avg = dayCounts[i] > 0 ? total / dayCounts[i] : 0;
    if (avg > maxDayAvg) {
      maxDayAvg = avg;
      maxDay = i;
    }
  });

  const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  if (maxDayAvg > 0) {
    insights.push({
      id: stableId('day-pattern'),
      type: 'tip',
      title: 'Spending pattern detected',
      description: `You tend to spend most on ${dayNames[maxDay]} (avg $${maxDayAvg.toFixed(0)}/day). Planning ahead could help!`,
      icon: 'lightbulb',
      priority: 4,
    });
  }

  // 5. Savings rate change
  if (currentIncome > 0) {
    const savingsRate = ((currentIncome - currentExpenseTotal) / currentIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        id: stableId('savings-strong'),
        type: 'achievement',
        title: 'Strong savings rate',
        description: `Your savings rate is ${savingsRate.toFixed(0)}% this month. That's above the recommended 20%!`,
        icon: 'star',
        priority: 5,
      });
    } else if (savingsRate < 10 && savingsRate > 0) {
      insights.push({
        id: stableId('savings-low'),
        type: 'tip',
        title: 'Savings rate is low',
        description: `Your savings rate is ${savingsRate.toFixed(0)}%. Consider reviewing your biggest expense categories.`,
        icon: 'info',
        priority: 5,
      });
    }
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ===== Streak Calculations =====

export interface StreakData {
  noSpendStreak: number;
  underAverageStreak: number;
  dailyAverage: number;
}

export function calculateStreaks(transactions: Transaction[]): StreakData {
  const now = new Date();
  const last30Start = subDays(now, 29);
  const startStr = format(last30Start, 'yyyy-MM-dd');
  const endStr = format(now, 'yyyy-MM-dd');
  const days = eachDayOfInterval({ start: last30Start, end: now });

  // Build daily spending map — only consider transactions in the 30-day window
  const dailySpend = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date >= startStr && tx.date <= endStr) {
      dailySpend.set(tx.date, (dailySpend.get(tx.date) || 0) + tx.amount);
    }
  }

  const dailyAmounts = days.map((d) => dailySpend.get(format(d, 'yyyy-MM-dd')) || 0);
  const dailyAverage = dailyAmounts.reduce((s, a) => s + a, 0) / dailyAmounts.length || 0;

  // Count consecutive no-spend days from today backwards
  let noSpendStreak = 0;
  for (let i = dailyAmounts.length - 1; i >= 0; i--) {
    if (dailyAmounts[i] === 0) noSpendStreak++;
    else break;
  }

  // Count consecutive under-average days from today backwards
  let underAverageStreak = 0;
  for (let i = dailyAmounts.length - 1; i >= 0; i--) {
    if (dailyAmounts[i] <= dailyAverage) underAverageStreak++;
    else break;
  }

  return { noSpendStreak, underAverageStreak, dailyAverage };
}
