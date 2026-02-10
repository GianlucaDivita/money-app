import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[var(--accent-primary)] to-[#8b5cf6] text-white border-transparent shadow-lg shadow-[var(--accent-primary)]/25 hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 hover:brightness-110',
  secondary:
    'glass-sm hover:bg-[var(--surface-hover)] text-[var(--text-primary)]',
  ghost:
    'bg-transparent border-transparent hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]',
  danger:
    'bg-gradient-to-r from-[var(--accent-expense)] to-[#e11d48] text-white border-transparent shadow-lg shadow-[var(--accent-expense)]/25 hover:shadow-xl hover:brightness-110',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
};

export function GlassButton({
  variant = 'secondary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
