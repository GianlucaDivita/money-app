import { useState } from 'react';
import { Info } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { CurrencySelector } from './CurrencySelector';
import { CategoryManager } from './CategoryManager';
import { DataManagement } from './DataManagement';
import { RecurringManager } from '../recurring/RecurringManager';
import { GlassCard } from '../shared/GlassCard';
import { GlassButton } from '../shared/GlassButton';
import { WelcomeModal } from '../shared/WelcomeModal';

export function SettingsPage() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-5">
          <ThemeSelector />
          <CurrencySelector />
          <DataManagement />
        </div>
        <div className="flex flex-col gap-5">
          <CategoryManager />
          <RecurringManager />
          <GlassCard>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
              About BudgetLens
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              A privacy-first personal finance tracker. No accounts, no servers — your data never leaves this device.
            </p>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={<Info size={14} />}
              onClick={() => setShowAbout(true)}
            >
              About This App
            </GlassButton>
          </GlassCard>
        </div>
      </div>

      <WelcomeModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
