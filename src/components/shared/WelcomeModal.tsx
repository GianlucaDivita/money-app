import { Wallet, PenLine, BarChart3, ShieldCheck, Smartphone, Mail, Linkedin } from 'lucide-react';
import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  { icon: PenLine, label: 'Manual-first tracking that builds financial awareness' },
  { icon: BarChart3, label: 'Interactive charts, budgets, and smart insights' },
  { icon: ShieldCheck, label: '100% private — all data stays on your device' },
  { icon: Smartphone, label: 'Works beautifully on desktop and mobile' },
];

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Welcome to BudgetLens">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#8b5cf6] flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent-primary)]/25">
          <Wallet size={28} className="text-white" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
          Your personal, privacy-first budget tracker. Track spending, set budgets,
          and visualize your financial health — no sign-up required.
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-3 mb-5">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <Icon size={16} className="text-[var(--accent-primary)]" />
            </div>
            <span className="text-sm text-[var(--text-primary)] pt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--divider)] my-5" />

      {/* Portfolio Credit */}
      <div className="text-center mb-5">
        <p className="text-xs text-[var(--text-muted)] mb-1">Built by</p>
        <p className="text-sm font-semibold text-[var(--text-primary)] font-display">
          Gianluca Di Vita
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
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

      {/* CTA */}
      <GlassButton variant="primary" size="lg" className="w-full" onClick={onClose}>
        Get Started
      </GlassButton>
    </GlassModal>
  );
}
