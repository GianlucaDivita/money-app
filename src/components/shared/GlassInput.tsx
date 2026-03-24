import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, icon, className = '', id: propId, ...props }, ref) => {
    const autoId = useId();
    const inputId = propId || autoId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={`
              w-full glass-sm px-4 py-2.5 text-sm
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[var(--accent-expense)]' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span id={errorId} className="text-xs text-[var(--accent-expense)]" role="alert">{error}</span>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
