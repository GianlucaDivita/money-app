import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBudgetContext } from '../../context/BudgetContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CategoryIcon } from './CategoryIcon';
import { ROUTES } from '../../lib/constants';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { transactions, categories } = useBudgetContext();
  const { format: formatAmount } = useCurrency();
  const navigate = useNavigate();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Open with "/" key (when not in an input)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open, close on Escape
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = transactions
      .filter(tx =>
        tx.description.toLowerCase().includes(q) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(q))
      )
      .slice(0, 8);
    return matches;
  }, [query, transactions]);

  const handleSelect = useCallback(() => {
    setIsOpen(false);
    navigate(ROUTES.TRANSACTIONS);
  }, [navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} aria-hidden />
      <div className="relative w-full max-w-lg mx-4 animate-scale-in">
        <div className="glass p-4">
          <div className="flex items-center gap-3 mb-3">
            <Search size={18} className="text-[var(--text-muted)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search transactions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[var(--text-primary)] text-sm outline-none placeholder:text-[var(--text-muted)]"
            />
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer" aria-label="Close search">
              <X size={16} />
            </button>
          </div>

          {query.trim() && (
            <div className="border-t border-[var(--divider)] pt-2 max-h-[50vh] overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">No results found</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {results.map((tx) => {
                    const cat = categoryMap.get(tx.categoryId);
                    return (
                      <button
                        key={tx.id}
                        onClick={handleSelect}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-left cursor-pointer group"
                      >
                        {cat && <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">{tx.description}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {cat?.name}{tx.merchant ? ` · ${tx.merchant}` : ''} · {tx.date}
                          </p>
                        </div>
                        <span className={`text-sm font-mono font-medium shrink-0 ${tx.type === 'income' ? 'text-[var(--accent-income)]' : 'text-[var(--accent-expense)]'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                        </span>
                        <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--divider)]">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono glass-sm rounded text-[var(--text-muted)]">ESC</kbd>
            <span className="text-[10px] text-[var(--text-muted)]">to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
