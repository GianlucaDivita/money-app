import { useState, useMemo } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import type { Budget } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { useUndo } from '../../context/UndoContext';
import { GlassButton } from '../shared/GlassButton';
import { EmptyState } from '../shared/EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { calculateBudgetStatus } from '../../lib/calculations';
import { BudgetCard } from './BudgetCard';
import { BudgetForm } from './BudgetForm';

export function BudgetsPage() {
  const { budgets, transactions, categories, deleteBudget } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Filter transactions to current month
  const currentMonthTxs = useMemo(() => {
    const now = new Date();
    return transactions.filter((tx) =>
      isWithinInterval(parseISO(tx.date), { start: startOfMonth(now), end: endOfMonth(now) })
    );
  }, [transactions]);

  const budgetStatuses = useMemo(() => {
    const now = new Date();
    return budgets
      .filter((b) => b.isActive)
      .map((b) => calculateBudgetStatus(b, currentMonthTxs, now));
  }, [budgets, currentMonthTxs]);

  async function handleDelete() {
    if (!deletingId) return;
    const budget = budgets.find(b => b.id === deletingId);
    await deleteBudget(deletingId);
    if (budget) pushAction({ type: 'delete', entity: 'budget', description: `deleted budget`, before: budget });
    toast('success', 'Budget deleted');
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Budgets
        </h1>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => { setEditingBudget(undefined); setShowForm(true); }}
        >
          Set Budget
        </GlassButton>
      </div>

      {budgetStatuses.length === 0 ? (
        <EmptyState
          icon={<Wallet size={48} />}
          title="No budgets set"
          description="Set spending limits for your categories to stay on track."
          actionLabel="Set Your First Budget"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetStatuses.map((status, i) => (
            <div key={status.budget.id} className={`animate-fade-in-up stagger-${i + 1}`}>
              <BudgetCard
                status={status}
                category={categoryMap.get(status.budget.categoryId)}
                onEdit={() => { setEditingBudget(status.budget); setShowForm(true); }}
                onDelete={() => setDeletingId(status.budget.id)}
              />
            </div>
          ))}
        </div>
      )}

      <BudgetForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingBudget(undefined); }}
        editBudget={editingBudget}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to remove this budget limit?"
        confirmLabel="Delete"
      />
    </div>
  );
}
