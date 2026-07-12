import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CURRENCY, DEFAULT_REGION, getRegion } from '@/data/currencies';
import { seedBills, seedDebts, seedSettings, seedTransactions } from '@/data/seed';
import { monthISO } from '@/lib/dates';
import { setActiveCurrency } from '@/lib/format';
import { Bill, CategoryKey, Debt, Transaction, TransactionType, UserSettings } from '@/lib/types';

const FRESH_SETTINGS: UserSettings = {
  userName: '',
  startBalance: 0,
  salary: 0,
  savingsGoal: 0,
  privacyMode: false,
  region: DEFAULT_REGION,
  currency: DEFAULT_CURRENCY,
};

interface FinanceState {
  transactions: Transaction[];
  bills: Bill[];
  debts: Debt[];
  settings: UserSettings;

  addTransaction: (tx: {
    type: TransactionType;
    amount: number;
    category: CategoryKey;
    reason: string;
    date: string;
  }) => void;
  addBill: (bill: { name: string; amount: number; icon: string }) => void;
  removeBill: (id: string) => void;
  /** Marks a bill paid for the current month (or unpaid if already marked). */
  toggleBillPaid: (id: string) => void;
  addDebt: (debt: { name: string; total: number; monthly: number; icon: string }) => void;
  removeDebt: (id: string) => void;
  /** Reduces a debt's remaining balance by one monthly payment. */
  recordDebtPayment: (id: string) => void;
  adjustSalary: (delta: number) => void;
  adjustSavingsGoal: (delta: number) => void;
  setSalary: (salary: number) => void;
  setSavingsGoal: (savingsGoal: number) => void;
  setUserName: (userName: string) => void;
  setStartBalance: (startBalance: number) => void;
  /** Sets the user's region and switches the app currency to match it. */
  setRegion: (regionKey: string) => void;
  setPrivacyMode: (on: boolean) => void;
  /** Fills the app with the design-reference sample data (Settings → Load sample data). */
  loadSampleData: () => void;
  /** Wipes every transaction, bill, and debt and zeroes the budget. */
  eraseAllData: () => void;
}

/**
 * Single source of truth for Pocket, persisted to device storage.
 * Only raw data lives here — balance, budgets, and weekly stats are
 * derived in lib/selectors.ts.
 */
export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      bills: [],
      debts: [],
      settings: FRESH_SETTINGS,

      addTransaction: (tx) =>
        set((s) => ({
          transactions: [{ id: `t${Date.now()}`, ...tx }, ...s.transactions],
        })),

      addBill: (bill) =>
        set((s) => ({ bills: [...s.bills, { id: `b${Date.now()}`, ...bill }] })),

      removeBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      toggleBillPaid: (id) =>
        set((s) => ({
          bills: s.bills.map((b) =>
            b.id === id
              ? { ...b, lastPaidMonth: b.lastPaidMonth === monthISO() ? undefined : monthISO() }
              : b,
          ),
        })),

      addDebt: (debt) =>
        set((s) => ({
          debts: [
            ...s.debts,
            {
              id: `d${Date.now()}`,
              ...debt,
              originalTotal: debt.total,
              monthsLeft: debt.monthly > 0 ? Math.ceil(debt.total / debt.monthly) : 0,
            },
          ],
        })),

      removeDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      recordDebtPayment: (id) =>
        set((s) => ({
          debts: s.debts.map((d) => {
            if (d.id !== id) return d;
            const total = Math.max(0, d.total - d.monthly);
            return {
              ...d,
              total,
              monthsLeft: d.monthly > 0 ? Math.ceil(total / d.monthly) : 0,
            };
          }),
        })),

      adjustSalary: (delta) =>
        set((s) => ({
          settings: { ...s.settings, salary: Math.max(0, s.settings.salary + delta) },
        })),

      adjustSavingsGoal: (delta) =>
        set((s) => ({
          settings: { ...s.settings, savingsGoal: Math.max(0, s.settings.savingsGoal + delta) },
        })),

      setSalary: (salary) =>
        set((s) => ({ settings: { ...s.settings, salary: Math.max(0, salary) } })),

      setSavingsGoal: (savingsGoal) =>
        set((s) => ({ settings: { ...s.settings, savingsGoal: Math.max(0, savingsGoal) } })),

      setUserName: (userName) =>
        set((s) => ({ settings: { ...s.settings, userName } })),

      setStartBalance: (startBalance) =>
        set((s) => ({ settings: { ...s.settings, startBalance } })),

      setRegion: (regionKey) => {
        const region = getRegion(regionKey);
        setActiveCurrency(region.currency);
        set((s) => ({
          settings: { ...s.settings, region: region.key, currency: region.currency },
        }));
      },

      setPrivacyMode: (on) =>
        set((s) => ({ settings: { ...s.settings, privacyMode: on } })),

      loadSampleData: () =>
        set((s) => ({
          transactions: seedTransactions,
          bills: seedBills,
          debts: seedDebts,
          settings: {
            ...seedSettings,
            userName: s.settings.userName || seedSettings.userName,
            region: s.settings.region,
            currency: s.settings.currency,
          },
        })),

      eraseAllData: () =>
        set((s) => ({
          transactions: [],
          bills: [],
          debts: [],
          settings: {
            ...FRESH_SETTINGS,
            userName: s.settings.userName,
            region: s.settings.region,
            currency: s.settings.currency,
          },
        })),
    }),
    {
      name: 'pocket-finance',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted: unknown) => {
        // v0 → v1: settings gained region/currency.
        // v1 → v2: debts gained originalTotal (assume current total).
        const state = persisted as { settings?: Partial<UserSettings>; debts?: Debt[] };
        if (state?.settings) {
          state.settings = { ...FRESH_SETTINGS, ...state.settings };
        }
        if (state?.debts) {
          state.debts = state.debts.map((d) => ({
            ...d,
            originalTotal: d.originalTotal ?? d.total,
          }));
        }
        return state;
      },
      partialize: (s) => ({
        transactions: s.transactions,
        bills: s.bills,
        debts: s.debts,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        setActiveCurrency(state?.settings.currency);
      },
    },
  ),
);
