import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import type { Budget } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { useUndo } from '../../context/UndoContext';
import { GlassModal } from '../shared/GlassModal';
import { GlassInput } from '../shared/GlassInput';
import { GlassSelect } from '../shared/GlassSelect';
import { GlassButton } from '../shared/GlassButton';
import { DollarSign } from 'lucide-react';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget;
}

export function BudgetForm({ isOpen, onClose, editBudget }: BudgetFormProps) {
  const { categories, budgets, addBudget, updateBudget } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');

  const isEditing = !!editBudget;

  // Categories that don't already have a budget (unless editing that budget)
  const existingBudgetCategoryIds = new Set(
    budgets.filter((b) => b.id !== editBudget?.id).map((b) => b.categoryId)
  );
  const availableCategories = categories.filter(
    (c) => (c.type === 'expense' || c.type === 'both') && !existingBudgetCategoryIds.has(c.id)
  );

  useEffect(() => {
    if (editBudget) {
      setCategoryId(editBudget.categoryId);
      setAmount(editBudget.amount.toString());
      setPeriod(editBudget.period);
    } else {
      setCategoryId('');
      setAmount('');
      setPeriod('monthly');
    }
  }, [editBudget, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast('error', 'Please enter a valid amount');
      return;
    }
    if (!categoryId) {
      toast('error', 'Please select a category');
      return;
    }

    const budget: Budget = {
      id: editBudget?.id || uuid(),
      categoryId,
      amount: parsedAmount,
      period,
      createdAt: editBudget?.createdAt || new Date().toISOString(),
      isActive: true,
    };

    if (isEditing) {
      pushAction({ type: 'update', entity: 'budget', description: `edited budget`, before: editBudget, after: budget });
      await updateBudget(budget);
      toast('success', 'Budget updated');
    } else {
      await addBudget(budget);
      pushAction({ type: 'add', entity: 'budget', description: `created budget`, after: budget });
      toast('success', 'Budget created');
    }

    onClose();
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Budget' : 'Set Budget'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <GlassSelect
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isEditing}
          required
        >
          <option value="">Select category...</option>
          {(isEditing ? categories : availableCategories).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </GlassSelect>

        <GlassInput
          label="Budget Limit"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={<DollarSign size={16} />}
          required
        />

        <GlassSelect
          label="Period"
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'monthly' | 'weekly')}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </GlassSelect>

        <div className="flex gap-3 mt-2">
          <GlassButton variant="secondary" type="button" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton variant="primary" type="submit" className="flex-1">
            {isEditing ? 'Save' : 'Create Budget'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
