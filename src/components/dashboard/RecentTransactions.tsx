import { useState } from 'react';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Transaction, Category } from '../../types';
import { GlassCard } from '../shared/GlassCard';
import { GlassButton } from '../shared/GlassButton';
import { EmptyState } from '../shared/EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { useToast } from '../shared/Toast';
import { useBudgetContext } from '../../context/BudgetContext';
import { TransactionRow } from '../transactions/TransactionRow';
import { TransactionForm } from '../transactions/TransactionForm';
import { ROUTES } from '../../lib/constants';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categoryMap: Map<string, Category>;
}

export function RecentTransactions({ transactions, categoryMap }: RecentTransactionsProps) {
  const navigate = useNavigate();
  const { deleteTransaction } = useBudgetContext();
  const { toast } = useToast();
  const [editingTx, setEditingTx] = useState<Transaction | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deletingId) return;
    await deleteTransaction(deletingId);
    toast('success', 'Transaction deleted');
    setDeletingId(null);
  }

  return (
    <GlassCard className="animate-fade-in-up stagger-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          Recent Transactions
        </h3>
        <GlassButton
          variant="ghost"
          size="sm"
          icon={<ArrowRight size={14} />}
          onClick={() => navigate(ROUTES.TRANSACTIONS)}
        >
          View All
        </GlassButton>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight size={36} />}
          title="No transactions yet"
          description="Add your first transaction to get started."
        />
      ) : (
        <div className="flex flex-col divide-y divide-[var(--divider)]">
          {transactions.map((tx) => (
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

      <TransactionForm
        isOpen={!!editingTx}
        onClose={() => setEditingTx(undefined)}
        editTransaction={editingTx}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmLabel="Delete"
      />
    </GlassCard>
  );
}
