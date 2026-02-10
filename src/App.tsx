import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BudgetProvider } from './context/BudgetContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastProvider } from './components/shared/Toast';
import { UndoProvider } from './context/UndoContext';
import { AppShell } from './components/layout/AppShell';
import { QuickAdd } from './components/shared/QuickAdd';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ROUTES } from './lib/constants';

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

export default function App() {
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
                  <div className="app-bg" />
                  <AppShell>
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
                  </AppShell>
                  <QuickAdd />
                </UndoProvider>
              </ToastProvider>
            </BudgetProvider>
          </CurrencyProvider>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
