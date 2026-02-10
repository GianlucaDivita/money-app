import { useState } from 'react';
import { Plus, RefreshCw, Pencil, Trash2, Pause, Play } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { GlassCard } from '../shared/GlassCard';
import { GlassButton } from '../shared/GlassButton';
import { EmptyState } from '../shared/EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { CategoryIcon } from '../shared/CategoryIcon';
import { useToast } from '../shared/Toast';
import { RecurringForm } from './RecurringForm';
import type { RecurringRule } from '../../types';

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function RecurringManager() {
  const { recurringRules, categories, updateRecurringRule, deleteRecurringRule } = useBudgetContext();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleEdit(rule: RecurringRule) {
    setEditingRule(rule);
    setShowForm(true);
  }

  async function handleToggleActive(rule: RecurringRule) {
    await updateRecurringRule({ ...rule, isActive: !rule.isActive });
    toast('success', rule.isActive ? 'Rule paused' : 'Rule activated');
  }

  async function handleDelete() {
    if (!deletingId) return;
    await deleteRecurringRule(deletingId);
    toast('success', 'Recurring rule deleted');
    setDeletingId(null);
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Recurring Transactions</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Auto-prompt for repeating income and expenses</p>
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => { setEditingRule(undefined); setShowForm(true); }}
        >
          Add Rule
        </GlassButton>
      </div>

      {recurringRules.length === 0 ? (
        <EmptyState
          icon={<RefreshCw size={36} />}
          title="No recurring rules"
          description="Set up rules for repeating transactions like rent, subscriptions, or salary."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {recurringRules.map((rule) => {
            const cat = categories.find((c) => c.id === rule.transactionTemplate.categoryId);
            return (
              <div
                key={rule.id}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${
                  rule.isActive ? 'glass-sm' : 'glass-sm opacity-50'
                }`}
              >
                {cat && <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {rule.transactionTemplate.description}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {frequencyLabels[rule.frequency]} &middot;{' '}
                    <CurrencyDisplay
                      amount={rule.transactionTemplate.amount}
                      className="inline text-xs"
                    />
                    {!rule.isActive && ' · Paused'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                    title={rule.isActive ? 'Pause' : 'Activate'}
                  >
                    {rule.isActive ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => handleEdit(rule)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingId(rule.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-expense)]/10 hover:text-[var(--accent-expense)] transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RecurringForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingRule(undefined); }}
        editRule={editingRule}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Recurring Rule"
        message="This will only delete the rule. Existing transactions created from it will be kept."
        confirmLabel="Delete"
      />
    </GlassCard>
  );
}
