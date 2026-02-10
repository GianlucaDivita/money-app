import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RecurringRule, Category } from '../../types';
import { generateBillCalendar, type CalendarBill } from '../../lib/billCalendar';
import { GlassCard } from '../shared/GlassCard';
import { CurrencyDisplay } from '../shared/CurrencyDisplay';
import { CategoryIcon } from '../shared/CategoryIcon';

interface BillCalendarProps {
  rules: RecurringRule[];
  categories: Category[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BillCalendar({ rules, categories }: BillCalendarProps) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const catMap = useMemo(
    () => new Map(categories.map(c => [c.id, c])),
    [categories]
  );

  const bills = useMemo(
    () => generateBillCalendar(rules, month),
    [rules, month]
  );

  const billsByDay = useMemo(() => {
    const map = new Map<string, CalendarBill[]>();
    bills.forEach(b => {
      const arr = map.get(b.date) || [];
      arr.push(b);
      map.set(b.date, arr);
    });
    return map;
  }, [bills]);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const startPad = getDay(days[0]); // 0=Sun
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const selectedBills = selectedDay ? (billsByDay.get(selectedDay) || []) : [];

  if (rules.filter(r => r.isActive).length === 0) return null;

  return (
    <GlassCard className="animate-fade-in-up stagger-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          Bill Calendar
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)] min-w-[110px] text-center">
            {format(month, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-[var(--text-muted)] font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for first week */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBills = billsByDay.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDay;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--accent-primary)] text-white'
                  : isToday
                  ? 'ring-2 ring-[var(--accent-primary)] text-[var(--text-primary)]'
                  : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
              }`}
            >
              {format(day, 'd')}
              {dayBills.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayBills.slice(0, 3).map((b, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? 'white' : (catMap.get(b.categoryId)?.color || 'var(--accent-primary)') }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedBills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--divider)] flex flex-col gap-2">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            {format(new Date(selectedDay + 'T00:00'), 'EEEE, MMMM d')}
          </p>
          {selectedBills.map((bill, i) => {
            const cat = catMap.get(bill.categoryId);
            return (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <CategoryIcon icon={cat?.icon || 'circle-dot'} color={cat?.color || '#888'} size="sm" />
                <span className="flex-1 text-sm text-[var(--text-primary)] truncate">
                  {bill.description}
                </span>
                <CurrencyDisplay
                  amount={bill.amount}
                  className="text-sm font-semibold text-[var(--accent-expense)]"
                />
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
