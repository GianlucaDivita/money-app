import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { TransactionForm } from '../transactions/TransactionForm';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  return (
    <div className="flex min-h-screen md:gap-6">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden pb-24 md:pb-10 transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <TopBar onAddTransaction={() => setShowTransactionForm(true)} />
          {children}
        </div>
      </main>
      <MobileNav />
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
      />
    </div>
  );
}
