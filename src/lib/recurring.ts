import { addDays, addWeeks, addMonths, addYears, parseISO, format, isBefore, isAfter, isEqual, startOfDay } from 'date-fns';
import type { RecurringRule, Transaction } from '../types';
import { v4 as uuid } from 'uuid';

interface DueRecurring {
  rule: RecurringRule;
  dueDates: string[]; // ISO date strings for each missed occurrence
}

export function getNextDate(from: Date, frequency: RecurringRule['frequency']): Date {
  switch (frequency) {
    case 'daily': return addDays(from, 1);
    case 'weekly': return addWeeks(from, 1);
    case 'biweekly': return addWeeks(from, 2);
    case 'monthly': return addMonths(from, 1);
    case 'yearly': return addYears(from, 1);
  }
}

/**
 * Find all recurring rules that have due dates up to today.
 * A rule is "due" if its next occurrence date is <= today and it hasn't been generated yet.
 */
export function findDueRecurring(rules: RecurringRule[], today: Date = new Date()): DueRecurring[] {
  const todayStart = startOfDay(today);
  const results: DueRecurring[] = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;
    if (rule.endDate && isAfter(todayStart, parseISO(rule.endDate))) continue;

    const startDate = parseISO(rule.startDate);
    const lastGenerated = rule.lastGeneratedDate ? parseISO(rule.lastGeneratedDate) : null;

    // Find the first uncovered date
    let cursor = lastGenerated ? getNextDate(startDate > lastGenerated ? startDate : lastGenerated, rule.frequency) : startDate;

    // If start date is in the future, skip
    if (isAfter(startOfDay(cursor), todayStart)) continue;

    const dueDates: string[] = [];
    // Collect all due dates (max 5 to avoid infinite loops for very old rules)
    let safety = 0;
    while ((isBefore(startOfDay(cursor), todayStart) || isEqual(startOfDay(cursor), todayStart)) && safety < 5) {
      dueDates.push(format(cursor, 'yyyy-MM-dd'));
      cursor = getNextDate(cursor, rule.frequency);
      safety++;
    }

    if (dueDates.length > 0) {
      results.push({ rule, dueDates });
    }
  }

  return results;
}

/**
 * Create a transaction from a recurring rule for a specific date.
 */
export function createTransactionFromRule(rule: RecurringRule, date: string): Transaction {
  const now = new Date().toISOString();
  return {
    ...rule.transactionTemplate,
    id: uuid(),
    date,
    createdAt: now,
    updatedAt: now,
    isRecurring: true,
    recurringId: rule.id,
  };
}
