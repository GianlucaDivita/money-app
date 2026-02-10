import type { Category } from '../types';

export const defaultCategories: Category[] = [
  // Expense categories
  { id: 'cat-groceries', name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#10b981', isDefault: true, sortOrder: 1 },
  { id: 'cat-dining', name: 'Dining Out', type: 'expense', icon: 'utensils', color: '#f97316', isDefault: true, sortOrder: 2 },
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: 'car', color: '#3b82f6', isDefault: true, sortOrder: 3 },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: 'gamepad-2', color: '#8b5cf6', isDefault: true, sortOrder: 4 },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899', isDefault: true, sortOrder: 5 },
  { id: 'cat-health', name: 'Health', type: 'expense', icon: 'heart-pulse', color: '#ef4444', isDefault: true, sortOrder: 6 },
  { id: 'cat-utilities', name: 'Utilities', type: 'expense', icon: 'zap', color: '#eab308', isDefault: true, sortOrder: 7 },
  { id: 'cat-housing', name: 'Housing', type: 'expense', icon: 'home', color: '#6366f1', isDefault: true, sortOrder: 8 },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: 'graduation-cap', color: '#0ea5e9', isDefault: true, sortOrder: 9 },
  { id: 'cat-subscriptions', name: 'Subscriptions', type: 'expense', icon: 'repeat', color: '#a855f7', isDefault: true, sortOrder: 10 },
  { id: 'cat-personal-care', name: 'Personal Care', type: 'expense', icon: 'sparkles', color: '#f472b6', isDefault: true, sortOrder: 11 },
  { id: 'cat-gifts', name: 'Gifts', type: 'expense', icon: 'gift', color: '#fb923c', isDefault: true, sortOrder: 12 },
  { id: 'cat-travel', name: 'Travel', type: 'expense', icon: 'plane', color: '#14b8a6', isDefault: true, sortOrder: 13 },

  // Income categories
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: 'briefcase', color: '#10b981', isDefault: true, sortOrder: 14 },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'laptop', color: '#6366f1', isDefault: true, sortOrder: 15 },
  { id: 'cat-investments', name: 'Investments', type: 'income', icon: 'trending-up', color: '#0ea5e9', isDefault: true, sortOrder: 16 },
  { id: 'cat-refunds', name: 'Refunds', type: 'income', icon: 'rotate-ccw', color: '#f59e0b', isDefault: true, sortOrder: 17 },
  { id: 'cat-other-income', name: 'Other Income', type: 'income', icon: 'coins', color: '#8b5cf6', isDefault: true, sortOrder: 18 },
];
