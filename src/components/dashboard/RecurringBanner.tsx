import { useMemo, useState } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { findDueRecurring, createTransactionFromRule } from '../../lib/recurring';
import { useToast } from '../shared/Toast';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';

export function RecurringBanner() {
  const { recurringRules, addTransaction, updateRecurringRule } = useBudgetContext();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dueItems = useMemo(
    () => findDueRecurring(recurringRules),
    [recurringRules]
  );

  const visibleItems = dueItems.filter((item) => !dismissed.has(item.rule.id));

  if (visibleItems.length === 0) return null;

  async function handleConfirm(ruleId: string) {
    const item = dueItems.find((d) => d.rule.id === ruleId);
    if (!item) return;

    // Create transactions for all due dates
    for (const date of item.dueDates) {
      const tx = createTransactionFromRule(item.rule, date);
      await addTransaction(tx);
    }

    // Update the rule's lastGeneratedDate to the latest due date
    const latestDate = item.dueDates[item.dueDates.length - 1];
    await updateRecurringRule({
      ...item.rule,
      lastGeneratedDate: latestDate,
    });

    toast('success', `Added ${item.dueDates.length} recurring transaction${item.dueDates.length > 1 ? 's' : ''}`);
  }

  function handleDismiss(ruleId: string) {
    setDismissed((prev) => new Set(prev).add(ruleId));
  }

  return (
    <div className="flex flex-col gap-2">
      {visibleItems.map(({ rule, dueDates }) => (
        <div
          key={rule.id}
          className="glass-sm flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 animate-fade-in-up"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0">
            <RefreshCw size={16} className="text-[var(--accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {rule.transactionTemplate.description}
              {dueDates.length > 1 && (
                <span className="text-xs text-[var(--text-muted)] ml-1">
                  ({dueDates.length} pending)
                </span>
              )}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              <CurrencyDisplay
                amount={rule.transactionTemplate.amount}
                className="inline text-xs"
              />
              {' '}&middot; Due {dueDates[0]}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleConfirm(rule.id)}
              className="w-8 h-8 rounded-lg bg-[var(--accent-income)]/10 text-[var(--accent-income)] flex items-center justify-center hover:bg-[var(--accent-income)]/20 transition-colors cursor-pointer"
              title="Confirm"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => handleDismiss(rule.id)}
              className="w-8 h-8 rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)] flex items-center justify-center hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
