import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Target,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';
import { ROUTES } from '../../lib/constants';

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.TRANSACTIONS, icon: ArrowLeftRight, label: 'Transactions' },
  { to: ROUTES.BUDGETS, icon: Wallet, label: 'Budgets' },
  { to: ROUTES.ANALYTICS, icon: BarChart3, label: 'Analytics' },
  { to: ROUTES.GOALS, icon: Target, label: 'Goals' },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 sidebar-glass transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
      aria-label="Main navigation"
    >
      <div className={`flex flex-col h-full ${isCollapsed ? 'px-3 py-8' : 'px-7 py-10'} transition-all duration-300`}>
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center mb-8' : 'gap-4 px-3 mb-12'}`}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/25 shrink-0">
            <Wallet size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-xl font-display font-bold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                BudgetLens
              </span>
              <p className="text-[11px] text-[var(--text-muted)]">Personal Finance</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-2.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-5'} py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: toggle + version */}
        <div className={`mt-auto ${isCollapsed ? 'px-0' : 'px-3'} pb-4`}>
          <div className="h-px bg-[var(--divider)] mb-5" />
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] transition-all duration-200 cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!isCollapsed && <span className="text-xs whitespace-nowrap">Collapse</span>}
          </button>
          {!isCollapsed && (
            <p className="text-[11px] text-[var(--text-muted)] mt-3 text-center">BudgetLens v1.0</p>
          )}
        </div>
      </div>
    </aside>
  );
}
