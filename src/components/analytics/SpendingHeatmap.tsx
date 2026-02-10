import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  subMonths,
} from 'date-fns';
import type { Transaction } from '../../types';
import { GlassCard } from '../shared/GlassCard';

interface SpendingHeatmapProps {
  transactions: Transaction[];
}

function getIntensityColor(amount: number, max: number): string {
  if (amount === 0) return 'var(--divider)';
  const ratio = amount / max;
  if (ratio < 0.25) return 'var(--accent-income)';
  if (ratio < 0.5) return 'var(--accent-warning)';
  if (ratio < 0.75) return '#f97316';
  return 'var(--accent-expense)';
}

export function SpendingHeatmap({ transactions }: SpendingHeatmapProps) {
  const { days, maxAmount } = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(subMonths(now, 2));
    const end = endOfMonth(now);
    const allDays = eachDayOfInterval({ start, end });

    // Aggregate spending by day
    const dailyMap = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const key = tx.date;
        dailyMap.set(key, (dailyMap.get(key) || 0) + tx.amount);
      }
    });

    let max = 0;
    const days = allDays.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const amount = dailyMap.get(key) || 0;
      if (amount > max) max = amount;
      return { date: d, key, amount, dayOfWeek: getDay(d) };
    });

    return { days, maxAmount: max || 1 };
  }, [transactions]);

  // Group days into weeks (columns)
  const weeks = useMemo(() => {
    const result: (typeof days)[] = [];
    let currentWeek: typeof days = [];
    days.forEach((day) => {
      if (day.dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [days]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GlassCard className="animate-fade-in-up stagger-2">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Spending Heatmap
      </h3>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2 shrink-0">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-[14px] flex items-center text-[9px] text-[var(--text-muted)]"
              >
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>
          {/* Weeks grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {/* Pad the first week if it doesn't start on Sunday */}
              {wi === 0 &&
                Array.from({ length: week[0].dayOfWeek }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-[14px] h-[14px]" />
                ))}
              {week.map((day) => (
                <div
                  key={day.key}
                  className="w-[14px] h-[14px] rounded-[3px] transition-colors cursor-default"
                  style={{ backgroundColor: getIntensityColor(day.amount, maxAmount) }}
                  title={`${format(day.date, 'MMM d')}: $${day.amount.toFixed(2)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2.5 mt-4 text-[10px] text-[var(--text-muted)]">
        <span>Less</span>
        <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: 'var(--divider)' }} />
        <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: 'var(--accent-income)' }} />
        <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: 'var(--accent-warning)' }} />
        <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: '#f97316' }} />
        <div className="w-[12px] h-[12px] rounded-[2px]" style={{ backgroundColor: 'var(--accent-expense)' }} />
        <span>More</span>
      </div>
    </GlassCard>
  );
}
