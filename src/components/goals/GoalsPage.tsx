import { useState, useMemo } from 'react';
import { Plus, Target } from 'lucide-react';
import type { SavingsGoal } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { useUndo } from '../../context/UndoContext';
import { GlassButton } from '../shared/GlassButton';
import { EmptyState } from '../shared/EmptyState';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';

export function GoalsPage() {
  const { goals, deleteGoal } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'progress' | 'deadline' | 'name'>('progress');

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (sortBy === 'progress') {
        const pA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const pB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return pB - pA;
      }
      if (sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      return a.name.localeCompare(b.name);
    });
  }, [goals, sortBy]);

  async function handleDelete() {
    if (!deletingId) return;
    const goal = goals.find(g => g.id === deletingId);
    await deleteGoal(deletingId);
    if (goal) pushAction({ type: 'delete', entity: 'goal', description: `deleted ${goal.name}`, before: goal });
    toast('success', 'Goal deleted');
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Savings Goals
        </h1>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => { setEditingGoal(undefined); setShowForm(true); }}
        >
          New Goal
        </GlassButton>
      </div>

      {goals.length > 1 && (
        <div className="flex gap-2 animate-fade-in">
          {(['progress', 'deadline', 'name'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                sortBy === opt
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'glass-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt === 'progress' ? 'By Progress' : opt === 'deadline' ? 'By Deadline' : 'By Name'}
            </button>
          ))}
        </div>
      )}

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target size={48} />}
          title="No savings goals yet"
          description="Set a goal and watch your progress grow."
          actionLabel="Create Your First Goal"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedGoals.map((goal, i) => (
            <div key={goal.id} className={`animate-fade-in-up stagger-${i + 1}`}>
              <GoalCard
                goal={goal}
                onEdit={() => { setEditingGoal(goal); setShowForm(true); }}
                onDelete={() => setDeletingId(goal.id)}
              />
            </div>
          ))}
        </div>
      )}

      <GoalForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingGoal(undefined); }}
        editGoal={editingGoal}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this savings goal?"
        confirmLabel="Delete"
      />
    </div>
  );
}
