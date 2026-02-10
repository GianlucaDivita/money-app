import { openDB, type IDBPDatabase } from 'idb';
import type { Transaction, Category, Budget, SavingsGoal, RecurringRule } from '../types';
import { DB_NAME, DB_VERSION } from './constants';
import { defaultCategories } from './categories';

interface BudgetLensDB {
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'by-date': string;
      'by-category': string;
      'by-type': string;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
  budgets: {
    key: string;
    value: Budget;
  };
  savingsGoals: {
    key: string;
    value: SavingsGoal;
  };
  recurringRules: {
    key: string;
    value: RecurringRule;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let dbPromise: Promise<IDBPDatabase<BudgetLensDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<BudgetLensDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BudgetLensDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Transactions store with indexes
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-date', 'date');
          txStore.createIndex('by-category', 'categoryId');
          txStore.createIndex('by-type', 'type');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Budgets store
        if (!db.objectStoreNames.contains('budgets')) {
          db.createObjectStore('budgets', { keyPath: 'id' });
        }

        // Savings goals store
        if (!db.objectStoreNames.contains('savingsGoals')) {
          db.createObjectStore('savingsGoals', { keyPath: 'id' });
        }

        // Recurring rules store
        if (!db.objectStoreNames.contains('recurringRules')) {
          db.createObjectStore('recurringRules', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Seed default categories on first launch
export async function seedDefaults(): Promise<void> {
  const db = await getDB();
  const existingCategories = await db.getAll('categories');
  if (existingCategories.length === 0) {
    const tx = db.transaction('categories', 'readwrite');
    await Promise.all(defaultCategories.map((cat) => tx.store.put(cat)));
    await tx.done;
  }
}

// ===== Transaction CRUD =====

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAll('transactions');
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  const db = await getDB();
  return db.get('transactions', id);
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', transaction);
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', transaction);
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);
}

// ===== Category CRUD =====

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

export async function addCategory(category: Category): Promise<void> {
  const db = await getDB();
  await db.put('categories', category);
}

export async function updateCategory(category: Category): Promise<void> {
  const db = await getDB();
  await db.put('categories', category);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('categories', id);
}

// ===== Budget CRUD =====

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDB();
  return db.getAll('budgets');
}

export async function addBudget(budget: Budget): Promise<void> {
  const db = await getDB();
  await db.put('budgets', budget);
}

export async function updateBudget(budget: Budget): Promise<void> {
  const db = await getDB();
  await db.put('budgets', budget);
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('budgets', id);
}

// ===== Savings Goals CRUD =====

export async function getAllGoals(): Promise<SavingsGoal[]> {
  const db = await getDB();
  return db.getAll('savingsGoals');
}

export async function addGoal(goal: SavingsGoal): Promise<void> {
  const db = await getDB();
  await db.put('savingsGoals', goal);
}

export async function updateGoal(goal: SavingsGoal): Promise<void> {
  const db = await getDB();
  await db.put('savingsGoals', goal);
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('savingsGoals', id);
}

// ===== Recurring Rules CRUD =====

export async function getAllRecurringRules(): Promise<RecurringRule[]> {
  const db = await getDB();
  return db.getAll('recurringRules');
}

export async function addRecurringRule(rule: RecurringRule): Promise<void> {
  const db = await getDB();
  await db.put('recurringRules', rule);
}

export async function updateRecurringRule(rule: RecurringRule): Promise<void> {
  const db = await getDB();
  await db.put('recurringRules', rule);
}

export async function deleteRecurringRule(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('recurringRules', id);
}

// ===== Settings =====

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key, value });
}
