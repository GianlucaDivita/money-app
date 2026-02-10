import { useState, useMemo } from 'react';
import { Search, ArrowLeftRight } from 'lucide-react';
import { startOfWeek, startOfMonth, startOfYear, isAfter, isBefore, parseISO } from 'date-fns';
import type { Transaction, DateRange } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { GlassCard } from '../shared/GlassCard';
import { GlassInput } from '../shared/GlassInput';
import { GlassSelect } from '../shared/GlassSelect';
import { EmptyState } from '../shared/EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useToast } from '../shared/Toast';
import { useUndo } from '../../context/UndoContext';
import { TransactionRow } from './TransactionRow';
import { TransactionForm } from './TransactionForm';

export function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('this-month');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;

    if (dateRange === 'this-week') startDate = startOfWeek(now);
    else if (dateRange === 'this-month') startDate = startOfMonth(now);
    else if (dateRange === 'this-year') startDate = startOfYear(now);

    return transactions.filter((tx) => {
      // Date range
      if (startDate && isBefore(parseISO(tx.date), startDate)) return false;
      if (startDate && isAfter(parseISO(tx.date), now)) return false;

      // Category
      if (filterCategory && tx.categoryId !== filterCategory) return false;

      // Type
      if (filterType && tx.type !== filterType) return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchMerchant = tx.merchant?.toLowerCase().includes(q);
        const matchTags = tx.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchDesc && !matchMerchant && !matchTags) return false;
      }

      return true;
    });
  }, [transactions, search, dateRange, filterCategory, filterType]);

  async function handleDelete() {
    if (!deletingId) return;
    const tx = transactions.find(t => t.id === deletingId);
    await deleteTransaction(deletingId);
    if (tx) pushAction({ type: 'delete', entity: 'transaction', description: `deleted ${tx.description}`, before: tx });
    toast('success', 'Transaction deleted');
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] animate-fade-in-up">
        Transactions
      </h1>

      {/* Filters */}
      <GlassCard compact>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <GlassInput
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <GlassSelect
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
          >
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="this-year">This Year</option>
            <option value="custom">All Time</option>
          </GlassSelect>
          <GlassSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </GlassSelect>
          <GlassSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </GlassSelect>
        </div>
      </GlassCard>

      {/* Transaction list */}
      <GlassCard>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight size={48} />}
            title="No transactions found"
            description={
              transactions.length === 0
                ? 'Add your first transaction to start tracking your finances.'
                : 'Try adjusting your filters to find what you\'re looking for.'
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-[var(--divider)]">
            {filtered.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                category={categoryMap.get(tx.categoryId)}
                onEdit={setEditingTx}
                onDelete={setDeletingId}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Edit modal */}
      <TransactionForm
        isOpen={!!editingTx}
        onClose={() => setEditingTx(undefined)}
        editTransaction={editingTx}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
