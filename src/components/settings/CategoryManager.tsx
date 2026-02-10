import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { GlassCard } from '../shared/GlassCard';
import { GlassButton } from '../shared/GlassButton';
import { GlassModal } from '../shared/GlassModal';
import { GlassInput } from '../shared/GlassInput';
import { GlassSelect } from '../shared/GlassSelect';
import { CategoryIcon } from '../shared/CategoryIcon';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import * as db from '../../lib/db';

const iconOptions = [
  'shopping-cart', 'utensils', 'car', 'gamepad-2', 'shopping-bag',
  'heart-pulse', 'zap', 'home', 'graduation-cap', 'repeat',
  'sparkles', 'gift', 'plane', 'briefcase', 'laptop',
  'trending-up', 'rotate-ccw', 'coins', 'piggy-bank', 'coffee',
  'music', 'dumbbell', 'scissors', 'book', 'wrench',
];

const colorOptions = [
  '#10b981', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ef4444', '#eab308', '#6366f1', '#0ea5e9', '#a855f7',
  '#f472b6', '#fb923c', '#14b8a6',
];

export function CategoryManager() {
  const { categories, transactions, refreshData } = useBudgetContext();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Category['type']>('expense');
  const [icon, setIcon] = useState('shopping-cart');
  const [color, setColor] = useState('#10b981');

  function openAdd() {
    setEditing(null);
    setName('');
    setType('expense');
    setIcon('shopping-cart');
    setColor('#10b981');
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast('error', 'Category name is required');
      return;
    }

    const category: Category = {
      id: editing?.id || uuid(),
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: editing?.isDefault || false,
      sortOrder: editing?.sortOrder || categories.length + 1,
    };

    if (editing) {
      await db.updateCategory(category);
      toast('success', 'Category updated');
    } else {
      await db.addCategory(category);
      toast('success', 'Category added');
    }

    await refreshData();
    setShowForm(false);
  }

  async function handleDelete() {
    if (!deletingId) return;
    const hasTransactions = transactions.some((t) => t.categoryId === deletingId);
    if (hasTransactions) {
      toast('error', 'Cannot delete a category that has transactions');
      setDeletingId(null);
      return;
    }
    await db.deleteCategory(deletingId);
    await refreshData();
    toast('success', 'Category deleted');
    setDeletingId(null);
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter((c) => c.type === 'income' || c.type === 'both');

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">Categories</h3>
        <GlassButton variant="ghost" size="sm" icon={<Plus size={14} />} onClick={openAdd}>
          Add
        </GlassButton>
      </div>

      {/* Expense categories */}
      <p className="text-xs text-[var(--text-muted)] mb-2.5">Expense</p>
      <div className="flex flex-col gap-2 mb-5">
        {expenseCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2.5 py-2 group">
            <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
            <span className="text-sm text-[var(--text-primary)] flex-1">{cat.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(cat)} className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer">
                <Pencil size={12} />
              </button>
              {!cat.isDefault && (
                <button onClick={() => setDeletingId(cat.id)} className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Income categories */}
      <p className="text-xs text-[var(--text-muted)] mb-2.5">Income</p>
      <div className="flex flex-col gap-2">
        {incomeCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2.5 py-2 group">
            <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
            <span className="text-sm text-[var(--text-primary)] flex-1">{cat.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(cat)} className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer">
                <Pencil size={12} />
              </button>
              {!cat.isDefault && (
                <button onClick={() => setDeletingId(cat.id)} className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category form modal */}
      <GlassModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Category' : 'New Category'}
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <GlassInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />

          <GlassSelect
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as Category['type'])}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </GlassSelect>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg cursor-pointer transition-transform ${
                    color === c ? 'ring-2 ring-offset-1 ring-[var(--accent-primary)] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Icon</label>
            <div className="flex gap-1.5 flex-wrap max-h-[120px] overflow-y-auto">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-1 rounded-lg cursor-pointer transition-transform ${
                    icon === ic ? 'ring-2 ring-[var(--accent-primary)] scale-110' : ''
                  }`}
                >
                  <CategoryIcon icon={ic} color={color} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSave} className="flex-1">
              {editing ? 'Save' : 'Add Category'}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="This category will be permanently removed."
        confirmLabel="Delete"
      />
    </GlassCard>
  );
}
