import { useMemo, type ReactNode } from 'react';
import { format } from 'date-fns';
import { Settings } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { calculateHealthScore } from '../../lib/healthScore';
import { BalanceCard } from './BalanceCard';
import { SpendingPieChart } from './SpendingPieChart';
import { IncomeVsExpenseBar } from './IncomeVsExpenseBar';
import { TrendLineChart } from './TrendLineChart';
import { RecentTransactions } from './RecentTransactions';
import { BudgetProgressRings } from './BudgetProgressRings';
import { SavingsGoalTracker } from './SavingsGoalTracker';
import { SavingsRateSpotlight } from './SavingsRateSpotlight';
import { SpendingStreaks } from './SpendingStreaks';
import { HealthScoreGauge } from './HealthScoreGauge';
import { DashboardCustomizer } from './DashboardCustomizer';
import { InsightCards } from '../analytics/InsightCards';
import { RecurringBanner } from './RecurringBanner';
import { DashboardSkeleton } from '../shared/GlassSkeleton';

export function DashboardPage() {
  const { transactions, categories, budgets, goals, isLoading } = useBudgetContext();
  const {
    currentIncome,
    currentExpenses,
    netBalance,
    categoryBreakdown,
    monthlyTotals,
    dailySpending,
    recentTransactions,
    savingsRate,
  } = useAnalytics(transactions, categories);

  const layout = useDashboardLayout();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const healthScore = useMemo(
    () => calculateHealthScore(transactions, budgets, goals),
    [transactions, budgets, goals]
  );

  const isVisible = (id: string) =>
    layout.widgets.find(w => w.id === id)?.visible !== false;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Widget registry
  const widgetMap: Record<string, ReactNode> = {
    'recurring-banner': <RecurringBanner />,
    'balance-card': (
      <BalanceCard income={currentIncome} expenses={currentExpenses} balance={netBalance} />
    ),
    'spending-pie': (
      <SpendingPieChart data={categoryBreakdown} categories={categories} />
    ),
    'health-score': <HealthScoreGauge score={healthScore} />,
    'savings-rate': <SavingsRateSpotlight savingsRate={savingsRate} />,
    'streaks': <SpendingStreaks transactions={transactions} />,
    'budget-rings': <BudgetProgressRings />,
    'insight-cards': (
      <InsightCards transactions={transactions} categories={categories} budgets={budgets} />
    ),
    'income-vs-expense': <IncomeVsExpenseBar data={monthlyTotals} />,
    'trend-line': <TrendLineChart data={dailySpending} />,
    'recent-transactions': (
      <RecentTransactions transactions={recentTransactions} categoryMap={categoryMap} />
    ),
    'savings-goals': <SavingsGoalTracker />,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <button
          onClick={() => layout.setIsCustomizing(true)}
          className="p-2 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="Customize dashboard"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Recurring transaction banners */}
      {isVisible('recurring-banner') && widgetMap['recurring-banner']}

      {/* Hero row: Balance + Pie Chart */}
      {(isVisible('balance-card') || isVisible('spending-pie')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {isVisible('balance-card') && widgetMap['balance-card']}
          {isVisible('spending-pie') && widgetMap['spending-pie']}
        </div>
      )}

      {/* Stats row: Health Score + Savings Rate + Streaks + Budget Rings */}
      {(isVisible('health-score') || isVisible('savings-rate') || isVisible('streaks') || isVisible('budget-rings')) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isVisible('health-score') && widgetMap['health-score']}
          {isVisible('savings-rate') && widgetMap['savings-rate']}
          {isVisible('streaks') && widgetMap['streaks']}
          {isVisible('budget-rings') && widgetMap['budget-rings']}
        </div>
      )}

      {/* Smart Insights */}
      {isVisible('insight-cards') && widgetMap['insight-cards']}

      {/* Charts row */}
      {(isVisible('income-vs-expense') || isVisible('trend-line')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {isVisible('income-vs-expense') && widgetMap['income-vs-expense']}
          {isVisible('trend-line') && widgetMap['trend-line']}
        </div>
      )}

      {/* Bottom row: Transactions + Goals */}
      {(isVisible('recent-transactions') || isVisible('savings-goals')) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {isVisible('recent-transactions') && (
            <div className="lg:col-span-2">
              {widgetMap['recent-transactions']}
            </div>
          )}
          {isVisible('savings-goals') && widgetMap['savings-goals']}
        </div>
      )}

      {/* Customizer modal */}
      <DashboardCustomizer
        isOpen={layout.isCustomizing}
        onClose={() => layout.setIsCustomizing(false)}
        widgets={layout.widgets}
        toggleVisibility={layout.toggleVisibility}
        moveUp={layout.moveUp}
        moveDown={layout.moveDown}
        resetToDefault={layout.resetToDefault}
      />
    </div>
  );
}
