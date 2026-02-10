import { useState, useEffect, useRef, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { Command, Zap } from 'lucide-react';
import type { Transaction, Category } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from './Toast';
import { useUndo } from '../../context/UndoContext';
import { CategoryIcon } from './CategoryIcon';

/**
 * Parses shorthand like "$45 groceries Trader Joe's" into transaction parts.
 * Pattern: [$]<amount> <category-keyword> [merchant/description]
 */
function parseQuickInput(
  input: string,
  categories: Category[]
): { amount: number; category: Category | null; description: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match amount (with or without $)
  const amountMatch = trimmed.match(/^\$?(\d+(?:\.\d{1,2})?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);
  const rest = trimmed.slice(amountMatch[0].length).trim();

  // Try to match a category by name (case-insensitive, partial match)
  let matchedCategory: Category | null = null;
  let description = rest;

  for (const cat of categories) {
    const catLower = cat.name.toLowerCase();
    const restLower = rest.toLowerCase();
    if (restLower.startsWith(catLower)) {
      matchedCategory = cat;
      description = rest.slice(cat.name.length).trim();
      break;
    }
    // Also try partial/abbreviation match
    const words = restLower.split(/\s+/);
    if (words[0] && catLower.startsWith(words[0]) && words[0].length >= 3) {
      matchedCategory = cat;
      description = words.slice(1).join(' ');
      break;
    }
  }

  return { amount, category: matchedCategory, description: description || 'Quick entry' };
}

export function QuickAdd() {
  const { categories, addTransaction } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories]
  );

  const parsed = useMemo(
    () => parseQuickInput(input, expenseCategories),
    [input, expenseCategories]
  );

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInput('');
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed || parsed.amount <= 0) {
      toast('error', 'Could not parse. Try: "$45 groceries Trader Joe\'s"');
      return;
    }

    const now = new Date();
    const tx: Transaction = {
      id: uuid(),
      type: 'expense',
      amount: parsed.amount,
      categoryId: parsed.category?.id || expenseCategories[0]?.id || '',
      description: parsed.description,
      date: format(now, 'yyyy-MM-dd'),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await addTransaction(tx);
    pushAction({ type: 'add', entity: 'transaction', description: `added ${parsed.description}`, after: tx });
    toast('success', `Added $${parsed.amount.toFixed(2)} ${parsed.category?.name || ''}`);
    setInput('');
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Command bar */}
      <div className="relative w-full max-w-lg mx-4 animate-scale-in">
        <form onSubmit={handleSubmit}>
          <div className="glass p-2 flex items-center gap-3">
            <div className="pl-2 text-[var(--text-muted)]">
              <Zap size={18} />
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='$45 groceries Trader Joe&apos;s'
              className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-sm py-2"
            />
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--divider)] text-[10px] text-[var(--text-muted)]">
              <Command size={10} /> K
            </div>
          </div>
        </form>

        {/* Preview */}
        {parsed && parsed.amount > 0 && (
          <div className="glass mt-2 p-3 flex items-center gap-3 text-sm">
            {parsed.category && (
              <CategoryIcon icon={parsed.category.icon} color={parsed.category.color} size="sm" />
            )}
            <div className="flex-1">
              <span className="font-mono font-semibold text-[var(--accent-expense)]">
                ${parsed.amount.toFixed(2)}
              </span>
              <span className="text-[var(--text-muted)] mx-1">·</span>
              <span className="text-[var(--text-secondary)]">
                {parsed.category?.name || 'No category matched'}
              </span>
              {parsed.description && parsed.description !== 'Quick entry' && (
                <>
                  <span className="text-[var(--text-muted)] mx-1">·</span>
                  <span className="text-[var(--text-muted)]">{parsed.description}</span>
                </>
              )}
            </div>
            <span className="text-xs text-[var(--text-muted)]">Enter to add</span>
          </div>
        )}
      </div>
    </div>
  );
}
