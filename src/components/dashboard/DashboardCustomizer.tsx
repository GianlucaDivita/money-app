import { Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import type { DashboardLayout } from '../../types';
import { GlassModal } from '../shared/GlassModal';
import { GlassButton } from '../shared/GlassButton';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardLayout;
  toggleVisibility: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  resetToDefault: () => void;
}

export function DashboardCustomizer({
  isOpen,
  onClose,
  widgets,
  toggleVisibility,
  moveUp,
  moveDown,
  resetToDefault,
}: DashboardCustomizerProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Customize Dashboard">
      <div className="flex flex-col gap-2">
        {widgets.map((widget, i) => (
          <div
            key={widget.id}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
              widget.visible ? 'bg-transparent' : 'opacity-50'
            }`}
          >
            {/* Visibility toggle */}
            <button
              onClick={() => toggleVisibility(widget.id)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer transition-colors"
              aria-label={widget.visible ? 'Hide' : 'Show'}
            >
              {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            {/* Label */}
            <span className="flex-1 text-sm text-[var(--text-primary)]">
              {widget.label}
            </span>

            {/* Reorder buttons */}
            <div className="flex gap-0.5">
              <button
                onClick={() => moveUp(widget.id)}
                disabled={i === 0}
                className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] disabled:opacity-20 cursor-pointer transition-colors"
                aria-label="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveDown(widget.id)}
                disabled={i === widgets.length - 1}
                className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] disabled:opacity-20 cursor-pointer transition-colors"
                aria-label="Move down"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--divider)]">
        <GlassButton variant="secondary" onClick={resetToDefault} className="flex-1">
          Reset to Default
        </GlassButton>
        <GlassButton variant="primary" onClick={onClose} className="flex-1">
          Done
        </GlassButton>
      </div>
    </GlassModal>
  );
}
