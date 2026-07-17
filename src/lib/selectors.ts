import { getCategory } from '@/data/categories';
import {
  billCycleISO,
  daysAgoISO,
  daysUntil,
  last7Days,
  monthISO,
  nextSalaryISO,
  previous7Days,
  todayISO,
  weekdayLabel,
} from '@/lib/dates';
import {
  Bill,
  Category,
  CategoryKey,
  Debt,
  SavingsChallenge,
  SavingsEntry,
  Transaction,
  UserSettings,
} from '@/lib/types';

/**
 * Derived values — computed from raw store data, never stored.
 * Formulas match the design reference logic exactly.
 */

/** Money sitting in the savings pot (deposits minus withdrawals). */
export function getSavedTotal(savings: SavingsEntry[]): number {
  return savings.reduce((a, s) => a + s.amount, 0);
}

/**
 * Spendable balance: start + income − spending − whatever was moved into
 * the savings pot. Saved money is shown separately and never spent from.
 */
export function getBalance(
  transactions: Transaction[],
  settings: UserSettings,
  savings: SavingsEntry[],
): number {
  const inSum = transactions.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0);
  const outSum = transactions.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0);
  return settings.startBalance + inSum - outSum - getSavedTotal(savings);
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

/** Whether a bill is paid for its current billing cycle (resets on its due day). */
export function isBillPaid(bill: Bill): boolean {
  return bill.lastPaidMonth === billCycleISO(bill.dueDay);
}

/** How many bills haven't been marked paid for their current cycle. */
export function getBillsLeft(bills: Bill[]): number {
  return bills.filter((b) => !isBillPaid(b)).length;
}

/** Percentage (0–100) of total debt still owed, or null when there is no debt history. */
export function getDebtPercentLeft(debts: Debt[]): number | null {
  const original = debts.reduce((a, d) => a + d.originalTotal, 0);
  if (original <= 0) return null;
  const remaining = debts.reduce((a, d) => a + d.total, 0);
  return Math.round((remaining / original) * 100);
}

/**
 * Auto-created bill payments (id "bill-<billId>-<cycle>", written by
 * toggleBillPaid) are already reserved by the monthly plan (salary − bills −
 * debt − savings), so they must NOT count against the daily discretionary
 * budget — otherwise marking rent paid would instantly blow the Daily ring.
 * They still count in balance, weekly cash flow, and history, which track
 * real money movements.
 */
function isBillPaymentTx(t: Transaction): boolean {
  return t.id.startsWith('bill-');
}

export function getTodaySpent(transactions: Transaction[]): number {
  const today = todayISO();
  return transactions
    .filter((t) => t.type === 'out' && t.date === today && !isBillPaymentTx(t))
    .reduce((a, t) => a + t.amount, 0);
}

export interface SpendPlan {
  /** Spendable balance right now (savings pot excluded). */
  balance: number;
  /** Money held back until the next payday. */
  reserved: { bills: number; debt: number; challenge: number };
  /** balance − reservations, right now (negative = over plan). */
  freeUntilPayday: number;
  daysToPayday: number;
  /** ISO date of the next payday. */
  nextPaydayDate: string;
  spentToday: number;
  /** Today's allowance: start-of-day free money spread over the days left. */
  dailyBudget: number;
  /** dailyBudget − spentToday (negative = over today's budget). */
  safeToSpendToday: number;
}

/**
 * The core money algorithm. Everything starts from the REAL balance (salary
 * only counts once its arrival is confirmed): reserve what must survive until
 * the next payday — unpaid bills, debt payments not yet made, the savings
 * challenge target — and spread the remainder over the days left. Overspend
 * today and tomorrow's budget shrinks; underspend and it grows.
 *
 * The daily allowance is anchored to the start of the day (spentToday is
 * added back before dividing) so the Daily ring fills against a stable
 * number instead of shrinking while you spend.
 */
export function getSpendPlan(
  transactions: Transaction[],
  settings: UserSettings,
  bills: Bill[],
  debts: Debt[],
  savings: SavingsEntry[],
  challenge: SavingsChallenge | null,
): SpendPlan {
  const nextPaydayDate = nextSalaryISO(settings.salaryDay);
  const daysToPayday = Math.max(1, daysUntil(nextPaydayDate));
  const reserved = {
    bills: getUnpaidBillsTotal(bills),
    debt: getDebtLeftThisMonth(debts),
    // 'lock' challenges already moved their money into the savings pot,
    // so only 'reserve' ones hold a slice of the balance back.
    challenge: challenge?.mode === 'reserve' ? challenge.target : 0,
  };
  const balance = getBalance(transactions, settings, savings);
  const freeUntilPayday = balance - reserved.bills - reserved.debt - reserved.challenge;
  const spentToday = getTodaySpent(transactions);
  const dailyBudget = Math.max(0, freeUntilPayday + spentToday) / daysToPayday;
  return {
    balance,
    reserved,
    freeUntilPayday,
    daysToPayday,
    nextPaydayDate,
    spentToday,
    dailyBudget,
    safeToSpendToday: dailyBudget - spentToday,
  };
}

export interface ChallengeProgress {
  /** How much of the target is still safe (0..target). */
  protectedAmount: number;
  /** 0–100 */
  pct: number;
  onTrack: boolean;
}

/**
 * How much of the challenge target is still intact. 'lock' targets sit in
 * the savings pot, so they're always fully protected; 'reserve' targets are
 * covered only as far as the current balance stretches after bills and debt.
 */
export function getChallengeProgress(
  transactions: Transaction[],
  settings: UserSettings,
  bills: Bill[],
  debts: Debt[],
  savings: SavingsEntry[],
  challenge: SavingsChallenge,
): ChallengeProgress {
  if (challenge.mode === 'lock' || challenge.target <= 0) {
    return { protectedAmount: challenge.target, pct: 100, onTrack: true };
  }
  const balance = getBalance(transactions, settings, savings);
  const afterCommitments = balance - getUnpaidBillsTotal(bills) - getDebtLeftThisMonth(debts);
  const protectedAmount = Math.max(0, Math.min(challenge.target, afterCommitments));
  return {
    protectedAmount,
    pct: Math.round((protectedAmount / challenge.target) * 100),
    onTrack: protectedAmount >= challenge.target,
  };
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
  color: string;
  amount: number;
  /** Share of this week's spending, 0–100. */
  pct: number;
}

export function getTopCategoriesThisWeek(
  transactions: Transaction[],
  categories: Category[],
  limit = 4,
): TopCategory[] {
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
    .map(([key, amount]) => {
      const cat = getCategory(categories, key);
      return {
        key,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        amount,
        pct: Math.round((amount / (weekOut || 1)) * 100),
      };
    });
}

export interface DaySegment {
  key: CategoryKey;
  color: string;
  amount: number;
  /** Share of today's spending, 0–1. */
  fraction: number;
}

/** Today's spending grouped by category — drives the colored daily ring. */
export function getTodayCategorySegments(
  transactions: Transaction[],
  categories: Category[],
): DaySegment[] {
  const today = todayISO();
  const totals = new Map<CategoryKey, number>();
  for (const t of transactions) {
    if (t.type !== 'out' || t.date !== today || isBillPaymentTx(t)) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  const total = [...totals.values()].reduce((a, v) => a + v, 0);
  if (total <= 0) return [];
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, amount]) => ({
      key,
      color: getCategory(categories, key).color,
      amount,
      fraction: amount / total,
    }));
}

/** Transactions newest-first (by date, then insertion order). */
export function getRecentTransactions(transactions: Transaction[], limit = 10): Transaction[] {
  return transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);
}

/** Today's discretionary transactions (bill payments live in history instead). */
export function getTodayTransactions(transactions: Transaction[]): Transaction[] {
  const today = todayISO();
  return transactions.filter((t) => t.date === today && !isBillPaymentTx(t));
}

export interface DayHistory {
  date: string;
  spent: number;
  received: number;
  transactions: Transaction[];
}

/** Every documented day, newest first, with per-day totals. */
export function getDayHistory(
  transactions: Transaction[],
  opts?: { excludeToday?: boolean },
): DayHistory[] {
  const byDay = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const list = byDay.get(t.date) ?? [];
    list.push(t);
    byDay.set(t.date, list);
  }
  const today = todayISO();
  return [...byDay.entries()]
    .filter(([date]) => !(opts?.excludeToday && date === today))
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, txs]) => ({
      date,
      spent: txs.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0),
      received: txs.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0),
      transactions: txs,
    }));
}

/** Months (YYYY-MM) that have at least one transaction, newest first. */
export function getMonthsWithData(transactions: Transaction[]): string[] {
  return [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse();
}

export interface MonthHistory {
  monthIn: number;
  monthOut: number;
  days: DayHistory[];
}

export interface BudgetMonthHistory {
  month: string;
  /** Actually saved that month: income − spending (can be negative). */
  saved: number;
  /** Sum of debt payments recorded that month. */
  debtPaid: number;
}

/**
 * Month-by-month savings and debt-payment history, newest first.
 * Months come from both transactions and recorded debt payments.
 */
export function getBudgetMonthHistory(
  transactions: Transaction[],
  debts: Debt[],
): BudgetMonthHistory[] {
  const payments = debts.flatMap((d) => d.payments);
  const months = new Set<string>([
    ...transactions.map((t) => t.date.slice(0, 7)),
    ...payments.map((p) => p.date.slice(0, 7)),
  ]);
  return [...months]
    .sort()
    .reverse()
    .map((month) => {
      const inMonth = transactions.filter((t) => t.date.startsWith(month));
      const monthIn = inMonth.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0);
      const monthOut = inMonth.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0);
      return {
        month,
        saved: monthIn - monthOut,
        debtPaid: payments
          .filter((p) => p.date.startsWith(month))
          .reduce((a, p) => a + p.amount, 0),
      };
    });
}

/** Totals and day-by-day history for one month (YYYY-MM). */
export function getMonthHistory(transactions: Transaction[], month: string): MonthHistory {
  const inMonth = transactions.filter((t) => t.date.startsWith(month));
  return {
    monthIn: inMonth.filter((t) => t.type === 'in').reduce((a, t) => a + t.amount, 0),
    monthOut: inMonth.filter((t) => t.type === 'out').reduce((a, t) => a + t.amount, 0),
    days: getDayHistory(inMonth),
  };
}

/** Total amount of bills not yet paid for their current cycle. */
export function getUnpaidBillsTotal(bills: Bill[]): number {
  return bills.filter((b) => !isBillPaid(b)).reduce((a, b) => a + b.amount, 0);
}

/** Debt money still due this month: monthly commitments minus payments already recorded. */
export function getDebtLeftThisMonth(debts: Debt[]): number {
  const month = monthISO();
  return debts.reduce((a, d) => {
    if (d.total <= 0) return a;
    const paidThisMonth = d.payments
      .filter((p) => p.date.startsWith(month))
      .reduce((x, p) => x + p.amount, 0);
    return a + Math.max(0, Math.min(d.monthly, d.total) - paidThisMonth);
  }, 0);
}

export interface NoSpendStats {
  /** Days this month with zero discretionary spending (today not counted — it isn't over). */
  count: number;
  /** Longest run of consecutive no-spend days in that window. */
  bestStreak: number;
}

/**
 * No-spend days this month. Bill payments don't break a no-spend day (they're
 * planned money, see isBillPaymentTx). Days before the user's first recorded
 * transaction don't count, so a fresh account doesn't start with a fake
 * perfect month.
 */
export function getNoSpendStats(transactions: Transaction[]): NoSpendStats {
  if (transactions.length === 0) return { count: 0, bestStreak: 0 };
  const firstTracked = transactions.reduce(
    (min, t) => (t.date < min ? t.date : min),
    todayISO(),
  );
  const monthStart = `${monthISO()}-01`;
  const start = firstTracked > monthStart ? firstTracked : monthStart;
  const spentDays = new Set(
    transactions
      .filter((t) => t.type === 'out' && !isBillPaymentTx(t))
      .map((t) => t.date),
  );
  const startAgo = -daysUntil(start);
  let count = 0;
  let streak = 0;
  let bestStreak = 0;
  for (let i = startAgo; i >= 1; i--) {
    if (spentDays.has(daysAgoISO(i))) {
      streak = 0;
    } else {
      count += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
    }
  }
  return { count, bestStreak };
}

export interface WishAffordability {
  /** Free money until payday, after bills/debt/challenge (can be negative). */
  freeUntilPayday: number;
  /** What can safely go to wishes: up to half the free money. */
  freeForWishes: number;
  daysToSalary: number;
  /** ISO date of the next salary. */
  nextSalaryDate: string;
  /** What is being held back from the balance until the next salary. */
  reserved: { bills: number; debt: number; challenge: number; dailyLife: number };
}

/**
 * Can a wish be bought today without wrecking the rest of the month?
 * Wishes draw from the same free-until-payday pool as daily spending, so at
 * most HALF of it may go to wishes — the other half stays protected for
 * daily life. Simple, explainable, and it keeps a wish purchase from
 * flattening the daily budget to zero.
 */
export function getWishAffordability(
  transactions: Transaction[],
  settings: UserSettings,
  bills: Bill[],
  debts: Debt[],
  savings: SavingsEntry[],
  challenge: SavingsChallenge | null,
): WishAffordability {
  const plan = getSpendPlan(transactions, settings, bills, debts, savings, challenge);
  const free = Math.max(0, plan.freeUntilPayday);
  const freeForWishes = Math.floor(free / 2);
  return {
    freeUntilPayday: plan.freeUntilPayday,
    freeForWishes,
    daysToSalary: plan.daysToPayday,
    nextSalaryDate: plan.nextPaydayDate,
    reserved: { ...plan.reserved, dailyLife: free - freeForWishes },
  };
}
