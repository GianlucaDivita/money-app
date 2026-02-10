import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-[var(--accent-expense)]/10' : 'bg-[var(--accent-primary)]/10'}`}>
          <AlertTriangle
            size={24}
            className={variant === 'danger' ? 'text-[var(--accent-expense)]' : 'text-[var(--accent-primary)]'}
          />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        <div className="flex gap-3 w-full">
          <GlassButton variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}
