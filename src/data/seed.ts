import { billCycleISO, daysAgoISO } from '@/lib/dates';
import {
  Bill,
  CategoryKey,
  Debt,
  SavingsEntry,
  Transaction,
  UserSettings,
  Wish,
} from '@/lib/types';

/**
 * Sample data matching the design reference numbers, with dates shifted
 * relative to the real current day so the app looks alive on first run
 * (the design's "today" was 2026-07-01; offsets are preserved).
 */
const recentTransactions: Transaction[] = [
  { id: 't1', type: 'out', amount: 45, category: 'food', reason: 'Lunch at cafe', date: daysAgoISO(0) },
  { id: 't2', type: 'out', amount: 20, category: 'transport', reason: 'Taxi ride', date: daysAgoISO(0) },
  { id: 't3', type: 'out', amount: 120, category: 'shopping', reason: 'Groceries', date: daysAgoISO(1) },
  { id: 't4', type: 'in', amount: 8000, category: 'salary', reason: 'Monthly salary', date: daysAgoISO(1) },
  { id: 't5', type: 'out', amount: 60, category: 'fun', reason: 'Cinema night', date: daysAgoISO(2) },
  { id: 't6', type: 'out', amount: 35, category: 'food', reason: 'Dinner out', date: daysAgoISO(3) },
  { id: 't7', type: 'out', amount: 200, category: 'bills', reason: 'Internet bill', date: daysAgoISO(4) },
  { id: 't8', type: 'out', amount: 15, category: 'transport', reason: 'Bus card', date: daysAgoISO(5) },
  { id: 't9', type: 'out', amount: 90, category: 'health', reason: 'Pharmacy', date: daysAgoISO(6) },
];

/** Recurring expense patterns cycled through when generating past days. */
const expensePatterns: { category: CategoryKey; reason: string; base: number }[] = [
  { category: 'food', reason: 'Groceries', base: 70 },
  { category: 'food', reason: 'Lunch out', base: 40 },
  { category: 'transport', reason: 'Taxi ride', base: 25 },
  { category: 'food', reason: 'Coffee & snacks', base: 18 },
  { category: 'shopping', reason: 'Household stuff', base: 95 },
  { category: 'fun', reason: 'Night out', base: 60 },
  { category: 'transport', reason: 'Fuel', base: 45 },
  { category: 'health', reason: 'Pharmacy', base: 55 },
  { category: 'food', reason: 'Dinner out', base: 50 },
  { category: 'bills', reason: 'Phone top-up', base: 30 },
  { category: 'shopping', reason: 'Clothes', base: 140 },
  { category: 'fun', reason: 'Streaming rental', base: 15 },
];

/**
 * Deterministic 3-month history (days 7–90 back) so the History tab
 * (Daily/Weekly views) has something to browse. Some days are skipped on purpose so
 * the history looks organic, income lands roughly monthly.
 */
function buildHistory(): Transaction[] {
  const out: Transaction[] = [];
  for (let offset = 7; offset <= 90; offset++) {
    // Leave gaps: not every day gets documented.
    if (offset % 7 === 3 || offset % 11 === 5) continue;
    const count = 1 + (offset % 3);
    for (let i = 0; i < count; i++) {
      const p = expensePatterns[(offset * 3 + i * 5) % expensePatterns.length];
      const amount = p.base + ((offset * 7 + i * 13) % 40);
      out.push({
        id: `h${offset}-${i}`,
        type: 'out',
        amount,
        category: p.category,
        reason: p.reason,
        date: daysAgoISO(offset),
      });
    }
  }
  // Salary for the two previous months (this month's is t4), plus a freelance gig.
  out.push(
    { id: 'hs1', type: 'in', amount: 8000, category: 'salary', reason: 'Monthly salary', date: daysAgoISO(31) },
    { id: 'hs2', type: 'in', amount: 8000, category: 'salary', reason: 'Monthly salary', date: daysAgoISO(62) },
    { id: 'hf1', type: 'in', amount: 1500, category: 'freelance', reason: 'Logo design gig', date: daysAgoISO(24) },
    { id: 'hg1', type: 'in', amount: 400, category: 'gift', reason: 'Birthday gift', date: daysAgoISO(47) },
  );
  return out;
}

export const seedTransactions: Transaction[] = [...recentTransactions, ...buildHistory()];

export const seedBills: Bill[] = [
  { id: 'b1', name: 'Rent', amount: 2500, icon: 'house', dueDay: 1, lastPaidMonth: billCycleISO(1) },
  { id: 'b2', name: 'Utilities', amount: 400, icon: 'lightning', dueDay: 10 },
  { id: 'b3', name: 'Internet', amount: 200, icon: 'wifi-high', dueDay: 18, lastPaidMonth: billCycleISO(18) },
  { id: 'b4', name: 'Phone', amount: 150, icon: 'device-mobile', dueDay: 25 },
];

export const seedDebts: Debt[] = [
  {
    id: 'd1', name: 'Car loan', total: 24000, monthly: 1200, icon: 'car', monthsLeft: 20, originalTotal: 36000,
    payments: [
      { date: daysAgoISO(10), amount: 1200 },
      { date: daysAgoISO(41), amount: 1200 },
      { date: daysAgoISO(72), amount: 1200 },
    ],
  },
  {
    id: 'd2', name: 'Credit card', total: 6000, monthly: 800, icon: 'credit-card', monthsLeft: 8, originalTotal: 9000,
    payments: [
      { date: daysAgoISO(8), amount: 800 },
      { date: daysAgoISO(39), amount: 800 },
      { date: daysAgoISO(70), amount: 800 },
    ],
  },
];

/** Monthly moves into the savings pot, matching the sample savings goal. */
export const seedSavings: SavingsEntry[] = [
  { id: 's1', amount: 1000, date: daysAgoISO(60) },
  { id: 's2', amount: 1000, date: daysAgoISO(29) },
  { id: 's3', amount: 500, date: daysAgoISO(3) },
];

export const seedWishes: Wish[] = [
  { id: 'w1', name: 'Wireless headphones', price: 2800, createdAt: daysAgoISO(4) },
  { id: 'w2', name: 'Vespa scooter', price: 32000, createdAt: daysAgoISO(15) },
];

export const seedSettings: UserSettings = {
  userName: 'Yassine',
  startBalance: 3200,
  salary: 8000,
  savingsGoal: 1000,
  privacyMode: false,
  salaryDay: 1,
  themeMode: 'system',
  region: 'MA',
  currency: 'MAD',
};
