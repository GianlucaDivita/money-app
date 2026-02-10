import { Sun, Moon, Plus, Command } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { GlassButton } from '../shared/GlassButton';

interface TopBarProps {
  onAddTransaction: () => void;
}

export function TopBar({ onAddTransaction }: TopBarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="topbar-glass sticky top-0 z-30 flex items-center justify-between py-4 px-5 md:px-8 mb-6 -mx-5 md:mx-0 md:rounded-2xl md:mt-5 md:mb-8">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[#8b5cf6] flex items-center justify-center">
          <span className="text-white text-xs font-bold">BL</span>
        </div>
        <span className="font-display font-bold text-[var(--text-primary)]">BudgetLens</span>
      </div>

      {/* Kbd hint for desktop */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--divider)] text-xs text-[var(--text-muted)]">
        <Command size={12} />
        <span>K to quick-add</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus size={16} strokeWidth={2.5} />}
          onClick={onAddTransaction}
        >
          <span className="hidden sm:inline">Add Transaction</span>
        </GlassButton>
      </div>
    </header>
  );
}
