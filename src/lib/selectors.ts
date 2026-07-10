import { CATEGORIES } from '@/data/categories';
import { last7Days, previous7Days, todayISO, weekdayLabel } from '@/lib/dates';
import { Bill, CategoryKey, Debt, Transaction, UserSettings } from '@/lib/types';

/**
 * Derived values — computed from raw store data, never stored.
 * Formulas match the design reference logic exactly.
 */

export function getBalance(transactions: Transaction[], settings: UserSettings): number {
  const inSum = transactions.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0);
  const outSum = transactions.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0);
  return settings.startBalance + inSum - outSum;
}

export function getWeekTotals(transactions: Transaction[]): { weekIn: number; weekOut: number } {
  const week = last7Days();
  const inWeek = transactions.filter((t) => week.includes(t.date));
  return {
    weekIn: inWeek.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0),
    weekOut: inWeek.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0),
  };
}

export function getTotalBills(bills: Bill[]): number {
  return bills.reduce((a, b) => a + b.amount, 0);
}

export function getTotalDebtMonthly(debts: Debt[]): number {
  return debts.reduce((a, d) => a + d.monthly, 0);
}

/** What's left of salary after bills, debt payments, and the savings goal. */
export function getMonthlyAvailable(settings: UserSettings, bills: Bill[], debts: Debt[]): number {
  return settings.salary - getTotalBills(bills) - getTotalDebtMonthly(debts) - settings.savingsGoal;
}

/** Daily budget = (salary − bills − debt − savings) / 31 */
export function getDailyBudget(settings: UserSettings, bills: Bill[], debts: Debt[]): number {
  return Math.max(0, getMonthlyAvailable(settings, bills, debts)) / 31;
}

export function getTodaySpent(transactions: Transaction[]): number {
  const today = todayISO();
  return transactions
    .filter((t) => t.type === 'out' && t.date === today)
    .reduce((a, t) => a + t.amount, 0);
}

export function getSafeToSpendToday(
  transactions: Transaction[],
  settings: UserSettings,
  bills: Bill[],
  debts: Debt[],
): number {
  return getDailyBudget(settings, bills, debts) - getTodaySpent(transactions);
}

export interface WeekDayBar {
  date: string;
  label: string;
  out: number;
  isToday: boolean;
  /** 0..1 relative to the busiest day of the week */
  ratio: number;
}

export function getWeekDayBars(transactions: Transaction[]): WeekDayBar[] {
  const today = todayISO();
  const days = last7Days().map((date) => ({
    date,
    label: weekdayLabel(date),
    out: transactions
      .filter((t) => t.type === 'out' && t.date === date)
      .reduce((a, t) => a + t.amount, 0),
    isToday: date === today,
  }));
  const max = Math.max(1, ...days.map((d) => d.out));
  return days.map((d) => ({ ...d, ratio: d.out / max }));
}

export interface WeekDelta {
  /** Percent change vs last week (absolute value, rounded). */
  pct: number;
  more: boolean;
}

export function getWeekDelta(transactions: Transaction[]): WeekDelta {
  const { weekOut } = getWeekTotals(transactions);
  const lastWeek = previous7Days();
  const lastWeekOut = transactions
    .filter((t) => t.type === 'out' && lastWeek.includes(t.date))
    .reduce((a, t) => a + t.amount, 0);
  return {
    pct: lastWeekOut > 0 ? Math.round((Math.abs(weekOut - lastWeekOut) / lastWeekOut) * 100) : 0,
    more: weekOut >= lastWeekOut,
  };
}

export interface TopCategory {
  key: CategoryKey;
  label: string;
  icon: string;
  amount: number;
  /** Share of this week's spending, 0–100. */
  pct: number;
}

export function getTopCategoriesThisWeek(transactions: Transaction[], limit = 4): TopCategory[] {
  const week = last7Days();
  const totals = new Map<CategoryKey, number>();
  for (const t of transactions) {
    if (t.type !== 'out' || !week.includes(t.date)) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  const weekOut = [...totals.values()].reduce((a, v) => a + v, 0);
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, amount]) => ({
      key,
      label: CATEGORIES[key].label,
      icon: CATEGORIES[key].icon,
      amount,
      pct: Math.round((amount / (weekOut || 1)) * 100),
    }));
}

/** Transactions newest-first (by date, then insertion order). */
export function getRecentTransactions(transactions: Transaction[], limit = 10): Transaction[] {
  return transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);
}

export function getTodayTransactions(transactions: Transaction[]): Transaction[] {
  const today = todayISO();
  return transactions.filter((t) => t.date === today);
}
