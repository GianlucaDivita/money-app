// ===== Core Entities =====

export interface TransactionSplit {
  categoryId: string;
  amount: number;
  description?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  merchant?: string;
  date: string; // ISO 8601 YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
  notes?: string;
  splits?: TransactionSplit[];
  receiptImage?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string; // Lucide icon name
  color: string; // Hex color
  isDefault: boolean;
  sortOrder: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly';
  createdAt: string;
  isActive: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface RecurringRule {
  id: string;
  transactionTemplate: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'date'>;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastGeneratedDate?: string;
  isActive: boolean;
}

export interface UserSettings {
  currency: string; // ISO 4217
  locale: string;
  theme: 'light' | 'dark' | 'system';
  startOfWeek: 0 | 1;
  defaultView: 'dashboard' | 'transactions';
  fiscalMonthStart: number; // 1-12
}

// ===== Derived / Computed Types =====

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
  trend: number;
  averageTransaction: number;
}

export interface PeriodSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  topCategory: string;
  transactionCount: number;
}

export interface Insight {
  id: string;
  type: 'warning' | 'achievement' | 'trend' | 'tip';
  title: string;
  description: string;
  icon: string;
  relatedCategoryId?: string;
  priority: number;
}

// ===== Undo Types =====

export interface UndoAction {
  id: string;
  type: 'add' | 'update' | 'delete';
  entity: 'transaction' | 'budget' | 'goal';
  description: string;
  before?: Transaction | Budget | SavingsGoal;
  after?: Transaction | Budget | SavingsGoal;
}

// ===== Health Score Types =====

export interface HealthScoreComponent {
  label: string;
  score: number; // 0-100
  weight: number; // fraction, all weights sum to 1
}

export interface HealthScore {
  overall: number; // 0-100 weighted total
  components: HealthScoreComponent[];
  grade: 'poor' | 'fair' | 'good' | 'excellent';
}

// ===== Dashboard Layout Types =====

export interface DashboardWidget {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export type DashboardLayout = DashboardWidget[];

// ===== Utility Types =====

export type TransactionType = 'income' | 'expense';
export type ThemeMode = 'light' | 'dark' | 'system';
export type DateRange = 'this-week' | 'this-month' | 'this-year' | 'custom';

export interface TransactionFilter {
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
  tags?: string[];
}
