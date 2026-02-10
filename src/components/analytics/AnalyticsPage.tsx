import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { GlassButton } from '../shared/GlassButton';
import { CategoryBreakdown } from './CategoryBreakdown';
import { SpendingHeatmap } from './SpendingHeatmap';
import { MonthlyComparison } from './MonthlyComparison';
import { TopMerchants } from './TopMerchants';
import { InsightCards } from './InsightCards';
import { CategoryTrends } from './CategoryTrends';
import { BillCalendar } from './BillCalendar';
import { WaterfallChart } from './WaterfallChart';
import { YearInReview } from './YearInReview';

export function AnalyticsPage() {
  const { transactions, categories, budgets, recurringRules } = useBudgetContext();
  const { categoryBreakdown } = useAnalytics(transactions, categories);
  const [showYearReview, setShowYearReview] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Analytics
        </h1>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<CalendarClock size={16} />}
          onClick={() => setShowYearReview(true)}
        >
          Year in Review
        </GlassButton>
      </div>

      <InsightCards
        transactions={transactions}
        categories={categories}
        budgets={budgets}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CategoryBreakdown data={categoryBreakdown} categories={categories} />
        <TopMerchants transactions={transactions} />
      </div>

      <WaterfallChart transactions={transactions} categories={categories} />

      <SpendingHeatmap transactions={transactions} />

      <MonthlyComparison transactions={transactions} categories={categories} />

      <CategoryTrends transactions={transactions} categories={categories} />

      <BillCalendar rules={recurringRules} categories={categories} />

      <YearInReview
        isOpen={showYearReview}
        onClose={() => setShowYearReview(false)}
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
}
