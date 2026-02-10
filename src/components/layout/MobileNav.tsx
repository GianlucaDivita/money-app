import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Settings,
} from 'lucide-react';
import { ROUTES } from '../../lib/constants';

const mobileNavItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
  { to: ROUTES.TRANSACTIONS, icon: ArrowLeftRight, label: 'Activity' },
  { to: ROUTES.BUDGETS, icon: Wallet, label: 'Budgets' },
  { to: ROUTES.ANALYTICS, icon: BarChart3, label: 'Stats' },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'More' },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-heavy rounded-none border-t border-[var(--glass-border)] safe-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around py-2 px-2">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[52px] text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent-primary)]/10' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
