import { subMonths } from 'date-fns';
import type { Transaction, Budget, SavingsGoal, HealthScore } from '../types';
import { calculateBudgetStatus, isInRange, monthRangeStrings } from './calculations';

function interpolate(value: number, thresholds: [number, number][], scores: [number, number][]): number {
  for (let i = 0; i < thresholds.length; i++) {
    const [lo, hi] = thresholds[i];
    const [sLo, sHi] = scores[i];
    if (value <= hi) {
      const t = lo === hi ? 1 : (value - lo) / (hi - lo);
      return Math.round(sLo + t * (sHi - sLo));
    }
  }
  return 100;
}

export function calculateHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  now: Date = new Date()
): HealthScore {
  const curRange = monthRangeStrings(now);
  const prevRange = monthRangeStrings(subMonths(now, 1));

  // Single pass to partition current + previous month
  const currentTxs: Transaction[] = [];
  const prevTxs: Transaction[] = [];
  for (const tx of transactions) {
    if (isInRange(tx.date, curRange.start, curRange.end)) currentTxs.push(tx);
    else if (isInRange(tx.date, prevRange.start, prevRange.end)) prevTxs.push(tx);
  }

  const income = currentTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = currentTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 1. Savings Rate (30%)
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const savingsScore = interpolate(
    Math.max(savingsRate, 0),
    [[0, 10], [10, 20], [20, 30]],
    [[0, 50], [50, 80], [80, 100]]
  );

  // 2. Budget Adherence (25%)
  const activeBudgets = budgets.filter(b => b.isActive);
  let budgetScore = 100;
  if (activeBudgets.length > 0) {
    const scores = activeBudgets.map(b => {
      const status = calculateBudgetStatus(b, currentTxs, now);
      return Math.max(0, Math.min(100, (1 - status.percentUsed / 100) * 100));
    });
    budgetScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }

  // 3. Goal Progress (15%)
  let goalScore = 50; // default if no goals
  if (goals.length > 0) {
    const avgProgress = goals.reduce((s, g) =>
      s + Math.min(g.currentAmount / Math.max(g.targetAmount, 1), 1), 0
    ) / goals.length;
    goalScore = Math.round(avgProgress * 100);
  }

  // 4. Spending Trend (20%) — expenses down vs last month is good
  let trendScore = 50;
  if (prevExpenses > 0) {
    const change = ((expenses - prevExpenses) / prevExpenses) * 100;
    // -20% or more = 100, +20% or more = 0
    trendScore = Math.round(Math.max(0, Math.min(100, 50 - change * 2.5)));
  }

  // 5. Consistency (10%) — having transactions regularly
  const daysWithTxs = new Set(currentTxs.map(t => t.date)).size;
  const dayOfMonth = now.getDate();
  const consistencyRatio = dayOfMonth > 0 ? daysWithTxs / dayOfMonth : 0;
  const consistencyScore = Math.round(Math.min(consistencyRatio * 1.5, 1) * 100);

  const components = [
    { label: 'Savings Rate', score: savingsScore, weight: 0.30 },
    { label: 'Budget Adherence', score: budgetScore, weight: 0.25 },
    { label: 'Spending Trend', score: trendScore, weight: 0.20 },
    { label: 'Goal Progress', score: goalScore, weight: 0.15 },
    { label: 'Consistency', score: consistencyScore, weight: 0.10 },
  ];

  const overall = Math.round(
    components.reduce((s, c) => s + c.score * c.weight, 0)
  );

  const grade: HealthScore['grade'] =
    overall >= 70 ? 'excellent' :
    overall >= 50 ? 'good' :
    overall >= 30 ? 'fair' : 'poor';

  return { overall, components, grade };
}
