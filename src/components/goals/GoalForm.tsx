import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import type { SavingsGoal } from '../../types';
import { useBudgetContext } from '../../context/BudgetContext';
import { useToast } from '../shared/Toast';
import { useUndo } from '../../context/UndoContext';
import { GlassModal } from '../shared/GlassModal';
import { GlassInput } from '../shared/GlassInput';
import { GlassButton } from '../shared/GlassButton';
import { DollarSign, Type, Calendar, Palette } from 'lucide-react';
import { CategoryIcon } from '../shared/CategoryIcon';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: SavingsGoal;
}

const goalIcons = ['piggy-bank', 'plane', 'home', 'car', 'graduation-cap', 'heart', 'gift', 'shield', 'star', 'trophy'];
const goalColors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6', '#ef4444', '#14b8a6'];

export function GoalForm({ isOpen, onClose, editGoal }: GoalFormProps) {
  const { addGoal, updateGoal } = useBudgetContext();
  const { toast } = useToast();
  const { pushAction } = useUndo();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('piggy-bank');
  const [color, setColor] = useState('#10b981');

  const isEditing = !!editGoal;

  useEffect(() => {
    if (editGoal) {
      setName(editGoal.name);
      setTargetAmount(editGoal.targetAmount.toString());
      setCurrentAmount(editGoal.currentAmount.toString());
      setDeadline(editGoal.deadline || '');
      setIcon(editGoal.icon);
      setColor(editGoal.color);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setIcon('piggy-bank');
      setColor('#10b981');
    }
  }, [editGoal, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      toast('error', 'Please enter a goal name');
      return;
    }
    if (!target || target <= 0) {
      toast('error', 'Please enter a valid target amount');
      return;
    }

    const goal: SavingsGoal = {
      id: editGoal?.id || uuid(),
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: deadline || undefined,
      icon,
      color,
      createdAt: editGoal?.createdAt || new Date().toISOString(),
    };

    if (isEditing) {
      pushAction({ type: 'update', entity: 'goal', description: `edited ${goal.name}`, before: editGoal, after: goal });
      await updateGoal(goal);
      toast('success', 'Goal updated');
    } else {
      await addGoal(goal);
      pushAction({ type: 'add', entity: 'goal', description: `created ${goal.name}`, after: goal });
      toast('success', 'Goal created');
    }

    onClose();
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Goal' : 'New Savings Goal'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <GlassInput
          label="Goal Name"
          placeholder="e.g., Emergency Fund"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<Type size={16} />}
          required
        />

        <GlassInput
          label="Target Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          icon={<DollarSign size={16} />}
          required
        />

        <GlassInput
          label="Current Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
          icon={<DollarSign size={16} />}
        />

        <GlassInput
          label="Deadline (optional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          icon={<Calendar size={16} />}
        />

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Palette size={14} className="text-[var(--text-muted)]" /> Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {goalColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg cursor-pointer transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-[var(--accent-primary)] scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {goalIcons.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`p-1 rounded-lg cursor-pointer transition-transform ${
                  icon === ic ? 'ring-2 ring-[var(--accent-primary)] scale-110' : 'hover:scale-105'
                }`}
              >
                <CategoryIcon icon={ic} color={color} size="sm" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <GlassButton variant="secondary" type="button" onClick={onClose} className="flex-1">
            Cancel
          </GlassButton>
          <GlassButton variant="primary" type="submit" className="flex-1">
            {isEditing ? 'Save' : 'Create Goal'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
