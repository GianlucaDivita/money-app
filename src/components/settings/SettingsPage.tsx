import { useState } from 'react';
import { Info, Mail, Linkedin } from 'lucide-react';
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

            <div className="border-t border-[var(--divider)] pt-4 mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-1">Built by</p>
              <p className="text-sm font-semibold text-[var(--text-primary)] font-display mb-2">
                Gianluca Di Vita
              </p>
              <div className="flex flex-col gap-1.5">
                <a
                  href="mailto:gianlucajdivita@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:underline"
                >
                  <Mail size={13} />
                  gianlucajdivita@gmail.com
                </a>
                <a
                  href="https://www.linkedin.com/in/gianlucadivita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:underline"
                >
                  <Linkedin size={13} />
                  LinkedIn
                </a>
              </div>
            </div>

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
