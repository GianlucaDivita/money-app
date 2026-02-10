import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../shared/GlassCard';
import type { ThemeMode } from '../../types';

const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <GlassCard>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Theme
      </h3>
      <div className="flex gap-3">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex-1 flex flex-col items-center gap-2.5 py-4 rounded-xl transition-all cursor-pointer ${
              theme === value
                ? 'glass text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
