import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, error, icon, children, className = '', id: propId, ...props }, ref) => {
    const autoId = useId();
    const selectId = propId || autoId;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={`
              w-full glass-sm px-4 py-2.5 text-sm appearance-none
              text-[var(--text-primary)] bg-transparent
              outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[var(--accent-expense)]' : ''}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {error && (
          <span id={errorId} className="text-xs text-[var(--accent-expense)]" role="alert">{error}</span>
        )}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
