import { memo } from 'react';
import { GlassCard } from '../shared/GlassCard';

interface SavingsRateSpotlightProps {
  savingsRate: number;
}

function getRateColor(rate: number): string {
  if (rate >= 20) return 'var(--accent-income)';
  if (rate >= 10) return 'var(--accent-warning)';
  return 'var(--accent-expense)';
}

function getRateLabel(rate: number): string {
  if (rate >= 20) return 'Excellent';
  if (rate >= 10) return 'Good';
  if (rate >= 0) return 'Needs work';
  return 'Negative';
}

export const SavingsRateSpotlight = memo(function SavingsRateSpotlight({ savingsRate }: SavingsRateSpotlightProps) {
  const color = getRateColor(savingsRate);
  const label = getRateLabel(savingsRate);
  const clampedRate = Math.max(Math.min(savingsRate, 100), 0);

  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedRate / 100) * circumference;

  return (
    <GlassCard className="animate-fade-in-up stagger-5 flex flex-col items-center">
      <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--text-muted)] mb-6 self-start">
        Savings Rate
      </h3>
      <div className="relative my-1">
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--divider)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold text-[var(--text-primary)]">
            {savingsRate.toFixed(0)}%
          </span>
        </div>
      </div>
      <span
        className="text-sm font-medium px-3 py-1 rounded-full mt-2"
        style={{
          color,
          backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        }}
      >
        {label}
      </span>
    </GlassCard>
  );
});
