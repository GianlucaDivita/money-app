import { createContext, useContext, useCallback, useReducer, useEffect, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import type { UndoAction, Transaction, Budget, SavingsGoal } from '../types';
import { useBudgetContext } from './BudgetContext';
import { useToast } from '../components/shared/Toast';

const MAX_STACK = 10;

interface UndoState {
  past: UndoAction[];
  future: UndoAction[];
}

type UndoReducerAction =
  | { type: 'PUSH'; action: UndoAction }
  | { type: 'UNDO'; popped: UndoAction }
  | { type: 'REDO'; popped: UndoAction };

function undoReducer(state: UndoState, action: UndoReducerAction): UndoState {
  switch (action.type) {
    case 'PUSH':
      return {
        past: [action.action, ...state.past].slice(0, MAX_STACK),
        future: [],
      };
    case 'UNDO':
      return {
        past: state.past.slice(1),
        future: [action.popped, ...state.future].slice(0, MAX_STACK),
      };
    case 'REDO':
      return {
        past: [action.popped, ...state.past].slice(0, MAX_STACK),
        future: state.future.slice(1),
      };
  }
}

interface UndoContextValue {
  pushAction: (params: Omit<UndoAction, 'id'>) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoContext = createContext<UndoContextValue | null>(null);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const {
    addTransaction, updateTransaction, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal,
  } = useBudgetContext();
  const { toast } = useToast();

  const [state, dispatch] = useReducer(undoReducer, { past: [], future: [] });

  const pushAction = useCallback((params: Omit<UndoAction, 'id'>) => {
    dispatch({ type: 'PUSH', action: { ...params, id: uuid() } });
  }, []);

  const reverseAction = useCallback(async (action: UndoAction, isRedo: boolean) => {
    const effectiveType = isRedo ? action.type : (
      action.type === 'add' ? 'delete' :
      action.type === 'delete' ? 'add' : 'update'
    );

    const entity = isRedo
      ? (action.after ?? action.before)
      : (action.before ?? action.after);

    if (!entity) return;

    switch (action.entity) {
      case 'transaction':
        if (effectiveType === 'add') await addTransaction(entity as Transaction);
        else if (effectiveType === 'delete') await deleteTransaction(entity.id);
        else await updateTransaction(entity as Transaction);
        break;
      case 'budget':
        if (effectiveType === 'add') await addBudget(entity as Budget);
        else if (effectiveType === 'delete') await deleteBudget(entity.id);
        else await updateBudget(entity as Budget);
        break;
      case 'goal':
        if (effectiveType === 'add') await addGoal(entity as SavingsGoal);
        else if (effectiveType === 'delete') await deleteGoal(entity.id);
        else await updateGoal(entity as SavingsGoal);
        break;
    }
  }, [addTransaction, updateTransaction, deleteTransaction, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal]);

  const undo = useCallback(async () => {
    const action = state.past[0];
    if (!action) return;
    await reverseAction(action, false);
    dispatch({ type: 'UNDO', popped: action });
    toast('info', `Undone: ${action.description}`);
  }, [state.past, reverseAction, toast]);

  const redo = useCallback(async () => {
    const action = state.future[0];
    if (!action) return;
    await reverseAction(action, true);
    dispatch({ type: 'REDO', popped: action });
    toast('info', `Redone: ${action.description}`);
  }, [state.future, reverseAction, toast]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'z') return;

      // Don't intercept when user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const contextValue = useMemo<UndoContextValue>(() => ({
    pushAction,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }), [pushAction, undo, redo, state.past.length, state.future.length]);

  return (
    <UndoContext.Provider value={contextValue}>
      {children}
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error('useUndo must be used within UndoProvider');
  return ctx;
}
