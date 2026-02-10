import { createContext, useContext, useEffect, useReducer, useCallback, useMemo, type ReactNode } from 'react';
import type { Transaction, Category, Budget, SavingsGoal, RecurringRule } from '../types';
import * as db from '../lib/db';

// ===== State =====

interface BudgetState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurringRules: RecurringRule[];
  isLoading: boolean;
}

const initialState: BudgetState = {
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  recurringRules: [],
  isLoading: true,
};

// ===== Actions =====

type BudgetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALL'; payload: Partial<BudgetState> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'SET_RECURRING_RULES'; payload: RecurringRule[] }
  | { type: 'ADD_RECURRING_RULE'; payload: RecurringRule }
  | { type: 'UPDATE_RECURRING_RULE'; payload: RecurringRule }
  | { type: 'DELETE_RECURRING_RULE'; payload: string };

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ALL':
      return { ...state, ...action.payload, isLoading: false };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [action.payload, ...state.budgets] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'SET_RECURRING_RULES':
      return { ...state, recurringRules: action.payload };
    case 'ADD_RECURRING_RULE':
      return { ...state, recurringRules: [action.payload, ...state.recurringRules] };
    case 'UPDATE_RECURRING_RULE':
      return {
        ...state,
        recurringRules: state.recurringRules.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'DELETE_RECURRING_RULE':
      return { ...state, recurringRules: state.recurringRules.filter((r) => r.id !== action.payload) };
    default:
      return state;
  }
}

// ===== Context =====

interface BudgetContextValue extends BudgetState {
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Budget) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: SavingsGoal) => Promise<void>;
  updateGoal: (goal: SavingsGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addRecurringRule: (rule: RecurringRule) => Promise<void>;
  updateRecurringRule: (rule: RecurringRule) => Promise<void>;
  deleteRecurringRule: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function useBudgetContext() {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudgetContext must be used within BudgetProvider');
  return context;
}

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const [transactions, categories, budgets, goals, recurringRules] = await Promise.all([
      db.getAllTransactions(),
      db.getAllCategories(),
      db.getAllBudgets(),
      db.getAllGoals(),
      db.getAllRecurringRules(),
    ]);
    dispatch({
      type: 'SET_ALL',
      payload: {
        transactions: transactions.sort((a, b) => b.date.localeCompare(a.date)),
        categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
        budgets,
        goals,
        recurringRules,
      },
    });
  }, []);

  useEffect(() => {
    db.seedDefaults().then(loadData);
  }, [loadData]);

  const addTransaction = useCallback(async (tx: Transaction) => {
    await db.addTransaction(tx);
    dispatch({ type: 'ADD_TRANSACTION', payload: tx });
  }, []);

  const updateTransaction = useCallback(async (tx: Transaction) => {
    await db.updateTransaction(tx);
    dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await db.deleteTransaction(id);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);

  const addBudget = useCallback(async (budget: Budget) => {
    await db.addBudget(budget);
    dispatch({ type: 'ADD_BUDGET', payload: budget });
  }, []);

  const updateBudget = useCallback(async (budget: Budget) => {
    await db.updateBudget(budget);
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    await db.deleteBudget(id);
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  }, []);

  const addGoal = useCallback(async (goal: SavingsGoal) => {
    await db.addGoal(goal);
    dispatch({ type: 'ADD_GOAL', payload: goal });
  }, []);

  const updateGoal = useCallback(async (goal: SavingsGoal) => {
    await db.updateGoal(goal);
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await db.deleteGoal(id);
    dispatch({ type: 'DELETE_GOAL', payload: id });
  }, []);

  const addRecurringRule = useCallback(async (rule: RecurringRule) => {
    await db.addRecurringRule(rule);
    dispatch({ type: 'ADD_RECURRING_RULE', payload: rule });
  }, []);

  const updateRecurringRule = useCallback(async (rule: RecurringRule) => {
    await db.updateRecurringRule(rule);
    dispatch({ type: 'UPDATE_RECURRING_RULE', payload: rule });
  }, []);

  const deleteRecurringRule = useCallback(async (id: string) => {
    await db.deleteRecurringRule(id);
    dispatch({ type: 'DELETE_RECURRING_RULE', payload: id });
  }, []);

  const contextValue = useMemo<BudgetContextValue>(() => ({
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    refreshData: loadData,
  }), [
    state,
    addTransaction, updateTransaction, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal,
    addRecurringRule, updateRecurringRule, deleteRecurringRule,
    loadData,
  ]);

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}
