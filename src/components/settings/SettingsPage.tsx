import { ThemeSelector } from './ThemeSelector';
import { CurrencySelector } from './CurrencySelector';
import { CategoryManager } from './CategoryManager';
import { DataManagement } from './DataManagement';
import { RecurringManager } from '../recurring/RecurringManager';

export function SettingsPage() {
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
        </div>
      </div>
    </div>
  );
}
