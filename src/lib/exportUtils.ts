import type { Transaction, Category } from '../types';
import { format } from 'date-fns';

export function exportTransactionsCSV(
  transactions: Transaction[],
  categories: Category[]
): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Merchant', 'Tags', 'Splits'];
  const rows = transactions.map((tx) => [
    tx.date,
    tx.type,
    catMap.get(tx.categoryId) || 'Unknown',
    tx.amount.toFixed(2),
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    `"${(tx.merchant || '').replace(/"/g, '""')}"`,
    `"${(tx.tags || []).join(', ')}"`,
    `"${tx.splits ? tx.splits.map(s => `${catMap.get(s.categoryId) || s.categoryId}:${s.amount.toFixed(2)}`).join('; ') : ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportAllDataJSON(data: {
  transactions: Transaction[];
  categories: Category[];
}): string {
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateExportFilename(extension: string): string {
  return `budgetlens-export-${format(new Date(), 'yyyy-MM-dd')}.${extension}`;
}
