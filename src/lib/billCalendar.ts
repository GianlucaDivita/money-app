import {
  startOfMonth,
  endOfMonth,
  parseISO,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  format,
} from 'date-fns';
import type { RecurringRule } from '../types';
import { getNextDate } from './recurring';

export interface CalendarBill {
  ruleId: string;
  date: string; // yyyy-MM-dd
  description: string;
  amount: number;
  categoryId: string;
  isPastDue: boolean;
  isToday: boolean;
}

export function generateBillCalendar(
  rules: RecurringRule[],
  month: Date,
  today: Date = new Date()
): CalendarBill[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const todayStart = startOfDay(today);
  const bills: CalendarBill[] = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    const start = parseISO(rule.startDate);
    if (rule.endDate && isBefore(parseISO(rule.endDate), monthStart)) continue;

    // Walk from start until we pass monthEnd
    let cursor = start;
    let safety = 0;
    while (isBefore(cursor, monthStart) && safety < 500) {
      cursor = getNextDate(cursor, rule.frequency);
      safety++;
    }

    // Collect occurrences within the month
    safety = 0;
    while (!isAfter(cursor, monthEnd) && safety < 31) {
      const dateStr = format(cursor, 'yyyy-MM-dd');
      const dayStart = startOfDay(cursor);

      bills.push({
        ruleId: rule.id,
        date: dateStr,
        description: rule.transactionTemplate.description,
        amount: rule.transactionTemplate.amount,
        categoryId: rule.transactionTemplate.categoryId,
        isPastDue: isBefore(dayStart, todayStart),
        isToday: isEqual(dayStart, todayStart),
      });

      cursor = getNextDate(cursor, rule.frequency);
      safety++;
    }
  }

  return bills.sort((a, b) => a.date.localeCompare(b.date));
}
