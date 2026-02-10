import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { RecurringRule } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { GlassModal } from '../shared/GlassModal';
import { GlassInput } from '../shared/GlassInput';
import { GlassSelect } from '../shared/GlassSelect';
import { GlassButton } from '../shared/GlassButton';
import { CategoryIcon } from '../shared/CategoryIcon';

interface RecurringFormProps {
  isOpen: boolean;
  onClose: () => void;
  editRule?: RecurringRule;
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function RecurringForm({ isOpen, onClose, editRule }: RecurringFormProps) {
  const { categories, addRecurringRule, updateRecurringRule } = useBudgetContext();
  const { toast } = useToast();

  const [type, setType] = useState<'income' | 'expense'>(editRule?.transactionTemplate.type || 'expense');
  const [amount, setAmount] = useState(editRule?.transactionTemplate.amount?.toString() || '');
  const [description, setDescription] = useState(editRule?.transactionTemplate.description || '');
  const [merchant, setMerchant] = useState(editRule?.transactionTemplate.merchant || '');
  const [categoryId, setCategoryId] = useState(editRule?.transactionTemplate.categoryId || '');
  const [frequency, setFrequency] = useState<RecurringRule['frequency']>(editRule?.frequency || 'monthly');
  const [startDate, setStartDate] = useState(editRule?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(editRule?.endDate || '');

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !description || !categoryId) return;

    const rule: RecurringRule = {
      id: editRule?.id || uuid(),
      transactionTemplate: {
        type,
        amount: parsedAmount,
        categoryId,
        description,
        merchant: merchant || undefined,
        tags: [],
        isRecurring: true,
      },
      frequency,
      startDate,
      endDate: endDate || undefined,
      lastGeneratedDate: editRule?.lastGeneratedDate,
      isActive: true,
    };

    if (editRule) {
      await updateRecurringRule(rule);
      toast('success', 'Recurring rule updated');
    } else {
      await addRecurringRule(rule);
      toast('success', 'Recurring rule created');
    }
    onClose();
  }

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={editRule ? 'Edit Recurring Rule' : 'New Recurring Rule'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-[var(--accent-expense)]/10 text-[var(--accent-expense)] border border-[var(--accent-expense)]/30'
                : 'glass-sm text-[var(--text-muted)]'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-[var(--accent-income)]/10 text-[var(--accent-income)] border border-[var(--accent-income)]/30'
                : 'glass-sm text-[var(--text-muted)]'
            }`}
          >
            Income
          </button>
        </div>

        <GlassInput
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <GlassInput
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Monthly rent"
          required
        />

        <GlassInput
          label="Merchant (optional)"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="e.g., Landlord"
        />

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] transition-all cursor-pointer ${
                  categoryId === cat.id
                    ? 'glass-sm ring-2 ring-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                    : 'hover:bg-[var(--surface-hover)]'
                }`}
              >
                <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                <span className="text-[var(--text-secondary)] truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <GlassSelect
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurringRule['frequency'])}
        >
          {frequencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </GlassSelect>

        <div className="grid grid-cols-2 gap-3">
          <GlassInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <GlassInput
            label="End Date (optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <GlassButton type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" className="flex-1">
            {editRule ? 'Update' : 'Create'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
