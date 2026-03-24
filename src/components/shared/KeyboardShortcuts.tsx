import { GlassModal } from './GlassModal';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['\u2318/Ctrl', 'K'], description: 'Quick-add transaction' },
  { keys: ['/'], description: 'Search transactions' },
  { keys: ['\u2318/Ctrl', 'Z'], description: 'Undo last action' },
  { keys: ['\u2318/Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['?'], description: 'Show this help' },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="flex flex-col gap-3">
        {shortcuts.map(({ keys, description }) => (
          <div key={description} className="flex items-center justify-between py-1">
            <span className="text-sm text-[var(--text-secondary)]">{description}</span>
            <div className="flex items-center gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="px-2 py-1 text-xs font-mono glass-sm rounded-lg text-[var(--text-primary)] min-w-[28px] text-center"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassModal>
  );
}
