import { Plus, X } from 'lucide-react';
import type { TransactionSplit, Category } from '../../types';
import { GlassSelect } from '../shared/GlassSelect';
import { GlassInput } from '../shared/GlassInput';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';

interface SplitEditorProps {
  splits: TransactionSplit[];
  onChange: (splits: TransactionSplit[]) => void;
  categories: Category[];
  totalAmount: number;
}

export function SplitEditor({ splits, onChange, categories, totalAmount }: SplitEditorProps) {
  const splitTotal = splits.reduce((s, sp) => s + sp.amount, 0);
  const diff = totalAmount - splitTotal;
  const isBalanced = Math.abs(diff) < 0.01;

  function updateSplit(index: number, update: Partial<TransactionSplit>) {
    const next = splits.map((s, i) => (i === index ? { ...s, ...update } : s));
    onChange(next);
  }

  function addSplit() {
    onChange([...splits, { categoryId: '', amount: 0 }]);
  }

  function removeSplit(index: number) {
    onChange(splits.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Split Categories
      </label>

      {splits.map((split, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1">
            <GlassSelect
              value={split.categoryId}
              onChange={e => updateSplit(i, { categoryId: e.target.value })}
            >
              <option value="">Category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </GlassSelect>
          </div>
          <div className="w-28">
            <GlassInput
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={split.amount || ''}
              onChange={e => updateSplit(i, { amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <button
            type="button"
            onClick={() => removeSplit(i)}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-expense)] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSplit}
        className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:underline cursor-pointer self-start"
      >
        <Plus size={12} /> Add Split
      </button>

      {/* Running total */}
      {splits.length > 0 && (
        <div className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg ${
          isBalanced ? 'bg-[var(--accent-income)]/10 text-[var(--accent-income)]' : 'bg-[var(--accent-expense)]/10 text-[var(--accent-expense)]'
        }`}>
          <span>Split total: <CurrencyDisplay amount={splitTotal} className="font-mono" /></span>
          {!isBalanced && (
            <span>
              {diff > 0 ? 'Remaining' : 'Over'}: <CurrencyDisplay amount={Math.abs(diff)} className="font-mono" />
            </span>
          )}
          {isBalanced && <span>Balanced</span>}
        </div>
      )}
    </div>
  );
}
