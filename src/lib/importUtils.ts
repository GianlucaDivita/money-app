import { v4 as uuid } from 'uuid';
import type { Transaction } from '../types';

interface CSVRow {
  [key: string]: string;
}

export interface ColumnMapping {
  date: string;
  type: string;
  category: string;
  amount: string;
  description: string;
  merchant: string;
  tags: string;
}

export function parseCSV(content: string): { headers: string[]; rows: CSVRow[] } {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: CSVRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function mapCSVToTransactions(
  rows: CSVRow[],
  mapping: ColumnMapping,
  categoryIdMap: Map<string, string> // name -> id
): { transactions: Transaction[]; errors: string[] } {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  rows.forEach((row, i) => {
    try {
      const amountStr = row[mapping.amount]?.replace(/[$,]/g, '');
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${i + 2}: Invalid amount "${row[mapping.amount]}"`);
        return;
      }

      const date = row[mapping.date];
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push(`Row ${i + 2}: Invalid date "${date}" (expected YYYY-MM-DD)`);
        return;
      }

      const type = (row[mapping.type] || 'expense').toLowerCase();
      if (type !== 'income' && type !== 'expense') {
        errors.push(`Row ${i + 2}: Invalid type "${type}"`);
        return;
      }

      const categoryName = row[mapping.category] || '';
      const categoryId = categoryIdMap.get(categoryName.toLowerCase()) || '';

      const now = new Date().toISOString();
      const tags = row[mapping.tags]
        ? row[mapping.tags].split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;

      transactions.push({
        id: uuid(),
        type: type as 'income' | 'expense',
        amount,
        categoryId,
        description: row[mapping.description] || 'Imported',
        merchant: row[mapping.merchant] || undefined,
        date,
        tags,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      errors.push(`Row ${i + 2}: Unexpected error`);
    }
  });

  return { transactions, errors };
}
