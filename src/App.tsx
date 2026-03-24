import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BudgetProvider } from './context/BudgetContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastProvider } from './components/shared/Toast';
import { UndoProvider } from './context/UndoContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { QuickAdd } from './components/shared/QuickAdd';
import { GlobalSearch } from './components/shared/GlobalSearch';
import { KeyboardShortcuts } from './components/shared/KeyboardShortcuts';
import { WelcomeModal } from './components/shared/WelcomeModal';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ROUTES } from './lib/constants';
import { getSetting, setSetting, checkDBAvailability } from './lib/db';
import { AlertTriangle, X } from 'lucide-react';

// Lazy-load heavier pages to reduce initial bundle
const lazyImports = {
  transactions: () => import('./components/transactions/TransactionsPage'),
  budgets: () => import('./components/budgets/BudgetsPage'),
  analytics: () => import('./components/analytics/AnalyticsPage'),
  goals: () => import('./components/goals/GoalsPage'),
  settings: () => import('./components/settings/SettingsPage'),
};

const TransactionsPage = lazy(() => lazyImports.transactions().then(m => ({ default: m.TransactionsPage })));
const BudgetsPage = lazy(() => lazyImports.budgets().then(m => ({ default: m.BudgetsPage })));
const AnalyticsPage = lazy(() => lazyImports.analytics().then(m => ({ default: m.AnalyticsPage })));
const GoalsPage = lazy(() => lazyImports.goals().then(m => ({ default: m.GoalsPage })));
const SettingsPage = lazy(() => lazyImports.settings().then(m => ({ default: m.SettingsPage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-[40vh]">
      <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
    </div>
  );
}

// Animation classes that should be cleaned up after playing
const ANIM_CLASSES = ['animate-fade-in-up', 'animate-fade-in', 'animate-scale-in', 'animate-slide-in-left'];

function PrivateBrowsingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    checkDBAvailability().then(ok => { if (!ok) setShow(true); });
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] glass-sm border-b border-[var(--accent-warning)]/30 px-4 py-2.5 flex items-center justify-center gap-3 text-sm bg-[var(--accent-warning)]/10">
      <AlertTriangle size={16} className="text-[var(--accent-warning)] shrink-0" />
      <span className="text-[var(--text-primary)]">
        Private browsing detected — your data won't be saved between sessions.
      </span>
      <button onClick={() => setShow(false)} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export default function App() {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    getSetting<boolean>('welcome-dismissed').then(dismissed => {
      if (!dismissed) setWelcomeOpen(true);
    });
  }, []);

  const handleWelcomeDismiss = useCallback(() => {
    setSetting('welcome-dismissed', true);
    setWelcomeOpen(false);
  }, []);

  // Open keyboard shortcuts on "?" key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Prefetch all lazy routes after initial paint so tab switching is instant
  useEffect(() => {
    const prefetch = () => Object.values(lazyImports).forEach(load => load());
    const id = setTimeout(prefetch, 1000);
    return () => clearTimeout(id);
  }, []);

  // After entrance animations finish, remove the animation classes entirely
  // so Safari has zero stale animation state to re-evaluate on scroll/tab switch.
  // Removing classes (vs setting inline animation:none) keeps the DOM clean.
  useEffect(() => {
    function handleAnimationEnd(e: AnimationEvent) {
      const el = e.target as HTMLElement;
      for (const cls of ANIM_CLASSES) {
        if (el.classList.contains(cls)) {
          el.classList.remove(cls);
          break;
        }
      }
      // Remove stagger delay classes too
      el.classList.forEach(cls => {
        if (cls.startsWith('stagger-')) el.classList.remove(cls);
      });
    }
    document.addEventListener('animationend', handleAnimationEnd);
    return () => document.removeEventListener('animationend', handleAnimationEnd);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
          <CurrencyProvider>
            <BudgetProvider>
              <ToastProvider>
                <UndoProvider>
                  <PrivateBrowsingBanner />
                  <div className="app-bg" />
                  <AppShell>
                    <ErrorBoundary>
                      <Suspense fallback={<PageFallback />}>
                        <Routes>
                          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
                          <Route path={ROUTES.BUDGETS} element={<BudgetsPage />} />
                          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
                          <Route path={ROUTES.GOALS} element={<GoalsPage />} />
                          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </AppShell>
                  <QuickAdd />
                  <GlobalSearch />
                  <WelcomeModal isOpen={welcomeOpen} onClose={handleWelcomeDismiss} />
                  <KeyboardShortcuts isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
                </UndoProvider>
              </ToastProvider>
            </BudgetProvider>
          </CurrencyProvider>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
