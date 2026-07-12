import { daysAgoISO, monthISO } from '@/lib/dates';
import { Bill, Debt, Transaction, UserSettings } from '@/lib/types';

/**
 * Sample data matching the design reference numbers, with dates shifted
 * relative to the real current day so the app looks alive on first run
 * (the design's "today" was 2026-07-01; offsets are preserved).
 */
export const seedTransactions: Transaction[] = [
  { id: 't1', type: 'out', amount: 45, category: 'food', reason: 'Lunch at cafe', date: daysAgoISO(0) },
  { id: 't2', type: 'out', amount: 20, category: 'transport', reason: 'Taxi ride', date: daysAgoISO(0) },
  { id: 't3', type: 'out', amount: 120, category: 'shopping', reason: 'Groceries', date: daysAgoISO(1) },
  { id: 't4', type: 'in', amount: 8000, category: 'salary', reason: 'Monthly salary', date: daysAgoISO(1) },
  { id: 't5', type: 'out', amount: 60, category: 'fun', reason: 'Cinema night', date: daysAgoISO(2) },
  { id: 't6', type: 'out', amount: 35, category: 'food', reason: 'Dinner out', date: daysAgoISO(3) },
  { id: 't7', type: 'out', amount: 200, category: 'bills', reason: 'Internet bill', date: daysAgoISO(4) },
  { id: 't8', type: 'out', amount: 15, category: 'transport', reason: 'Bus card', date: daysAgoISO(5) },
  { id: 't9', type: 'out', amount: 90, category: 'health', reason: 'Pharmacy', date: daysAgoISO(6) },
  { id: 't10', type: 'out', amount: 80, category: 'food', reason: 'Groceries', date: daysAgoISO(9) },
  { id: 't11', type: 'out', amount: 150, category: 'shopping', reason: 'New shoes', date: daysAgoISO(11) },
  { id: 't12', type: 'out', amount: 40, category: 'transport', reason: 'Fuel', date: daysAgoISO(12) },
];

export const seedBills: Bill[] = [
  { id: 'b1', name: 'Rent', amount: 2500, icon: 'house', lastPaidMonth: monthISO() },
  { id: 'b2', name: 'Utilities', amount: 400, icon: 'lightning' },
  { id: 'b3', name: 'Internet', amount: 200, icon: 'wifi-high' },
  { id: 'b4', name: 'Phone', amount: 150, icon: 'device-mobile' },
];

export const seedDebts: Debt[] = [
  { id: 'd1', name: 'Car loan', total: 24000, monthly: 1200, icon: 'car', monthsLeft: 20, originalTotal: 36000 },
  { id: 'd2', name: 'Credit card', total: 6000, monthly: 800, icon: 'credit-card', monthsLeft: 8, originalTotal: 9000 },
];

export const seedSettings: UserSettings = {
  userName: 'Yassine',
  startBalance: 3200,
  salary: 8000,
  savingsGoal: 1000,
  privacyMode: false,
  region: 'MA',
  currency: 'MAD',
};
