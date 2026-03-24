import { openDB, type IDBPDatabase } from 'idb';
import type { Transaction, Category, Budget, SavingsGoal, RecurringRule } from '../types';
import { DB_NAME, DB_VERSION } from './constants';
import { defaultCategories } from './categories';

export class DBError extends Error {
  operation: string;
  cause: unknown;
  constructor(operation: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : 'Unknown database error';
    super(`Database error in ${operation}: ${message}`);
    this.name = 'DBError';
    this.operation = operation;
    this.cause = cause;
  }
}

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
  try {
    const db = await getDB();
    return await db.getAll('transactions');
  } catch (err) { throw new DBError('getAllTransactions', err); }
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  try {
    const db = await getDB();
    return await db.get('transactions', id);
  } catch (err) { throw new DBError('getTransaction', err); }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  try {
    const db = await getDB();
    await db.put('transactions', transaction);
  } catch (err) { throw new DBError('addTransaction', err); }
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  try {
    const db = await getDB();
    await db.put('transactions', transaction);
  } catch (err) { throw new DBError('updateTransaction', err); }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('transactions', id);
  } catch (err) { throw new DBError('deleteTransaction', err); }
}

// ===== Category CRUD =====

export async function getAllCategories(): Promise<Category[]> {
  try {
    const db = await getDB();
    return await db.getAll('categories');
  } catch (err) { throw new DBError('getAllCategories', err); }
}

export async function addCategory(category: Category): Promise<void> {
  try {
    const db = await getDB();
    await db.put('categories', category);
  } catch (err) { throw new DBError('addCategory', err); }
}

export async function updateCategory(category: Category): Promise<void> {
  try {
    const db = await getDB();
    await db.put('categories', category);
  } catch (err) { throw new DBError('updateCategory', err); }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('categories', id);
  } catch (err) { throw new DBError('deleteCategory', err); }
}

// ===== Budget CRUD =====

export async function getAllBudgets(): Promise<Budget[]> {
  try {
    const db = await getDB();
    return await db.getAll('budgets');
  } catch (err) { throw new DBError('getAllBudgets', err); }
}

export async function addBudget(budget: Budget): Promise<void> {
  try {
    const db = await getDB();
    await db.put('budgets', budget);
  } catch (err) { throw new DBError('addBudget', err); }
}

export async function updateBudget(budget: Budget): Promise<void> {
  try {
    const db = await getDB();
    await db.put('budgets', budget);
  } catch (err) { throw new DBError('updateBudget', err); }
}

export async function deleteBudget(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('budgets', id);
  } catch (err) { throw new DBError('deleteBudget', err); }
}

// ===== Savings Goals CRUD =====

export async function getAllGoals(): Promise<SavingsGoal[]> {
  try {
    const db = await getDB();
    return await db.getAll('savingsGoals');
  } catch (err) { throw new DBError('getAllGoals', err); }
}

export async function addGoal(goal: SavingsGoal): Promise<void> {
  try {
    const db = await getDB();
    await db.put('savingsGoals', goal);
  } catch (err) { throw new DBError('addGoal', err); }
}

export async function updateGoal(goal: SavingsGoal): Promise<void> {
  try {
    const db = await getDB();
    await db.put('savingsGoals', goal);
  } catch (err) { throw new DBError('updateGoal', err); }
}

export async function deleteGoal(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('savingsGoals', id);
  } catch (err) { throw new DBError('deleteGoal', err); }
}

// ===== Recurring Rules CRUD =====

export async function getAllRecurringRules(): Promise<RecurringRule[]> {
  try {
    const db = await getDB();
    return await db.getAll('recurringRules');
  } catch (err) { throw new DBError('getAllRecurringRules', err); }
}

export async function addRecurringRule(rule: RecurringRule): Promise<void> {
  try {
    const db = await getDB();
    await db.put('recurringRules', rule);
  } catch (err) { throw new DBError('addRecurringRule', err); }
}

export async function updateRecurringRule(rule: RecurringRule): Promise<void> {
  try {
    const db = await getDB();
    await db.put('recurringRules', rule);
  } catch (err) { throw new DBError('updateRecurringRule', err); }
}

export async function deleteRecurringRule(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('recurringRules', id);
  } catch (err) { throw new DBError('deleteRecurringRule', err); }
}

// ===== Settings =====

export async function getSetting<T>(key: string): Promise<T | undefined> {
  try {
    const db = await getDB();
    const result = await db.get('settings', key);
    return result?.value as T | undefined;
  } catch (err) { throw new DBError('getSetting', err); }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', { key, value });
  } catch (err) { throw new DBError('setSetting', err); }
}

// ===== Health Check =====

export async function checkDBAvailability(): Promise<boolean> {
  try {
    const db = await getDB();
    await db.put('settings', { key: '_healthcheck', value: true });
    const result = await db.get('settings', '_healthcheck');
    return result?.value === true;
  } catch {
    return false;
  }
}
