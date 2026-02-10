import { AnimatedNumber } from './AnimatedNumber';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  locale?: string;
  animated?: boolean;
  showSign?: boolean;
  className?: string;
}

function formatCurrency(amount: number, currency: string, locale: string, showSign: boolean): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  locale = 'en-US',
  animated = false,
  showSign = false,
  className = '',
}: CurrencyDisplayProps) {
  if (animated) {
    return (
      <AnimatedNumber
        value={amount}
        className={className}
        formatFn={(n) => formatCurrency(n, currency, locale, showSign)}
      />
    );
  }

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatCurrency(amount, currency, locale, showSign)}
    </span>
  );
}
