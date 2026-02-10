import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { DollarSign, FileText, Store, Calendar, Tag } from 'lucide-react';
import type { Transaction, TransactionType, TransactionSplit } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { useUndo } from '../../context/UndoContext';
import { GlassModal } from '../shared/GlassModal';
import { GlassInput } from '../shared/GlassInput';
import { GlassSelect } from '../shared/GlassSelect';
import { GlassButton } from '../shared/GlassButton';
import { CategoryIcon } from '../shared/CategoryIcon';
import { SplitEditor } from './SplitEditor';
import { ReceiptCapture } from './ReceiptCapture';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
}

export function TransactionForm({ isOpen, onClose, editTransaction }: TransactionFormProps) {
  const { categories, addTransaction, updateTransaction } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tags, setTags] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState<TransactionSplit[]>([]);
  const [receiptImage, setReceiptImage] = useState<string | undefined>();

  const isEditing = !!editTransaction;

  // Populate form when editing
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.categoryId);
      setDescription(editTransaction.description);
      setMerchant(editTransaction.merchant || '');
      setDate(editTransaction.date);
      setTags(editTransaction.tags?.join(', ') || '');
      setIsSplit(!!editTransaction.splits?.length);
      setSplits(editTransaction.splits || []);
      setReceiptImage(editTransaction.receiptImage);
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen]);

  function resetForm() {
    setType('expense');
    setAmount('');
    setCategoryId('');
    setDescription('');
    setMerchant('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTags('');
    setIsSplit(false);
    setSplits([]);
    setReceiptImage(undefined);
  }

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast('error', 'Please enter a valid amount');
      return;
    }
    if (!isSplit && !categoryId) {
      toast('error', 'Please select a category');
      return;
    }
    if (isSplit) {
      const validSplits = splits.filter(s => s.categoryId && s.amount > 0);
      if (validSplits.length < 2) {
        toast('error', 'Add at least 2 split categories');
        return;
      }
      const splitTotal = validSplits.reduce((s, sp) => s + sp.amount, 0);
      if (Math.abs(splitTotal - parsedAmount) > 0.01) {
        toast('error', 'Split amounts must equal the total');
        return;
      }
    }
    if (!description.trim()) {
      toast('error', 'Please enter a description');
      return;
    }

    const now = new Date().toISOString();
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const validSplits = isSplit ? splits.filter(s => s.categoryId && s.amount > 0) : undefined;

    const tx: Transaction = {
      id: editTransaction?.id || uuid(),
      type,
      amount: parsedAmount,
      categoryId: isSplit ? (validSplits![0].categoryId) : categoryId,
      description: description.trim(),
      merchant: merchant.trim() || undefined,
      date,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      createdAt: editTransaction?.createdAt || now,
      updatedAt: now,
      splits: validSplits,
      receiptImage,
    };

    if (isEditing) {
      pushAction({ type: 'update', entity: 'transaction', description: `edited ${tx.description}`, before: editTransaction, after: tx });
      await updateTransaction(tx);
      toast('success', 'Transaction updated');
    } else {
      await addTransaction(tx);
      pushAction({ type: 'add', entity: 'transaction', description: `added ${tx.description}`, after: tx });
      toast('success', 'Transaction added');
    }

    resetForm();
    onClose();
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 glass-sm rounded-xl">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategoryId(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-[var(--accent-expense)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategoryId(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-[var(--accent-income)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <GlassInput
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={<DollarSign size={16} />}
          required
        />

        {/* Split toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSplit}
            onChange={(e) => {
              setIsSplit(e.target.checked);
              if (e.target.checked && splits.length === 0) {
                setSplits([{ categoryId: '', amount: 0 }, { categoryId: '', amount: 0 }]);
              }
            }}
            className="accent-[var(--accent-primary)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Split across categories</span>
        </label>

        {isSplit ? (
          <SplitEditor
            splits={splits}
            onChange={setSplits}
            categories={filteredCategories}
            totalAmount={parseFloat(amount) || 0}
          />
        ) : (
          <>
            {/* Category */}
            <GlassSelect
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </GlassSelect>

            {/* Show selected category icon */}
            {categoryId && (() => {
              const cat = categories.find((c) => c.id === categoryId);
              return cat ? (
                <div className="flex items-center gap-2 -mt-2">
                  <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                  <span className="text-xs text-[var(--text-muted)]">{cat.name}</span>
                </div>
              ) : null;
            })()}
          </>
        )}

        {/* Description */}
        <GlassInput
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          icon={<FileText size={16} />}
          required
        />

        {/* Merchant (optional) */}
        <GlassInput
          label="Merchant (optional)"
          placeholder="e.g., Trader Joe's"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          icon={<Store size={16} />}
        />

        {/* Date */}
        <GlassInput
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          icon={<Calendar size={16} />}
          required
        />

        {/* Tags (optional) */}
        <GlassInput
          label="Tags (optional, comma-separated)"
          placeholder="vacation, tax-deductible"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          icon={<Tag size={16} />}
        />

        {/* Receipt */}
        <ReceiptCapture value={receiptImage} onChange={setReceiptImage} />

        {/* Submit */}
        <div className="flex gap-3 mt-2">
          <GlassButton variant="secondary" type="button" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton variant="primary" type="submit" className="flex-1">
            {isEditing ? 'Save Changes' : 'Add Transaction'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
