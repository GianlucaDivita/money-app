import { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, Sparkles } from 'lucide-react';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { GlassCard } from '../shared/GlassCard';
import { GlassButton } from '../shared/GlassButton';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import {
  exportTransactionsCSV,
  exportAllDataJSON,
  downloadFile,
  generateExportFilename,
} from '../../lib/exportUtils';
import { parseCSV, mapCSVToTransactions } from '../../lib/importUtils';
import { generateSampleTransactions } from '../../lib/sampleData';

export function DataManagement() {
  const { transactions, categories, addTransaction } = useBudgetContext();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  function handleExportCSV() {
    const csv = exportTransactionsCSV(transactions, categories);
    downloadFile(csv, generateExportFilename('csv'), 'text/csv');
    toast('success', 'Exported as CSV');
  }

  function handleExportJSON() {
    const json = exportAllDataJSON({ transactions, categories });
    downloadFile(json, generateExportFilename('json'), 'application/json');
    toast('success', 'Exported as JSON');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const content = await file.text();
      const { headers, rows } = parseCSV(content);

      if (rows.length === 0) {
        toast('error', 'No data found in CSV');
        return;
      }

      // Auto-map columns based on common header names
      const mapping = {
        date: headers.find((h) => /date/i.test(h)) || headers[0],
        type: headers.find((h) => /type/i.test(h)) || '',
        category: headers.find((h) => /category/i.test(h)) || '',
        amount: headers.find((h) => /amount/i.test(h)) || '',
        description: headers.find((h) => /desc|note/i.test(h)) || '',
        merchant: headers.find((h) => /merchant|payee/i.test(h)) || '',
        tags: headers.find((h) => /tag/i.test(h)) || '',
      };

      const categoryIdMap = new Map(
        categories.map((c) => [c.name.toLowerCase(), c.id])
      );

      const { transactions: imported, errors } = mapCSVToTransactions(rows, mapping, categoryIdMap);

      for (const tx of imported) {
        await addTransaction(tx);
      }

      if (errors.length > 0) {
        toast('warning', `Imported ${imported.length} transactions, ${errors.length} skipped`);
      } else {
        toast('success', `Imported ${imported.length} transactions`);
      }
    } catch {
      toast('error', 'Failed to parse CSV file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleReset() {
    // Clear IndexedDB and reload
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
    window.location.reload();
  }

  return (
    <GlassCard>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Data Management
      </h3>

      <div className="flex flex-col gap-5">
        {/* Export */}
        <div className="flex flex-wrap gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportJSON}
          >
            Export JSON
          </GlassButton>
        </div>

        {/* Import */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import CSV'}
          </GlassButton>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            CSV should have headers: Date, Type, Category, Amount, Description
          </p>
        </div>

        {/* Sample Data */}
        <div>
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={async () => {
              setSeeding(true);
              try {
                const sampleTxs = generateSampleTransactions();
                for (const tx of sampleTxs) {
                  await addTransaction(tx);
                }
                toast('success', `Loaded ${sampleTxs.length} sample transactions`);
              } catch {
                toast('error', 'Failed to load sample data');
              } finally {
                setSeeding(false);
              }
            }}
            disabled={seeding || transactions.length > 0}
          >
            {seeding ? 'Loading...' : 'Load Sample Data'}
          </GlassButton>
          {transactions.length > 0 && (
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Reset data first to load samples
            </p>
          )}
        </div>

        {/* Reset */}
        <div className="pt-3 border-t border-[var(--divider)]">
          <GlassButton
            variant="danger"
            size="sm"
            icon={<AlertTriangle size={14} />}
            onClick={() => setShowResetConfirm(true)}
          >
            Reset All Data
          </GlassButton>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will permanently delete all transactions, budgets, goals, and settings. This cannot be undone."
        confirmLabel="Reset Everything"
      />
    </GlassCard>
  );
}
