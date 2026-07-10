import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedBills, seedDebts, seedSettings, seedTransactions } from '@/data/seed';
import { Bill, CategoryKey, Debt, Mood, Transaction, TransactionType, UserSettings } from '@/lib/types';

const FRESH_SETTINGS: UserSettings = {
  userName: '',
  startBalance: 0,
  salary: 0,
  savingsGoal: 0,
  privacyMode: false,
};

interface FinanceState {
  transactions: Transaction[];
  bills: Bill[];
  debts: Debt[];
  settings: UserSettings;
  /** Today's mood from the Daily screen (session-only, not persisted). */
  mood: Mood | null;

  addTransaction: (tx: {
    type: TransactionType;
    amount: number;
    category: CategoryKey;
    reason: string;
    date: string;
  }) => void;
  addBill: (bill: { name: string; amount: number; icon: string }) => void;
  removeBill: (id: string) => void;
  addDebt: (debt: { name: string; total: number; monthly: number; icon: string }) => void;
  removeDebt: (id: string) => void;
  adjustSalary: (delta: number) => void;
  adjustSavingsGoal: (delta: number) => void;
  setUserName: (userName: string) => void;
  setStartBalance: (startBalance: number) => void;
  setMood: (mood: Mood) => void;
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
      mood: null,

      addTransaction: (tx) =>
        set((s) => ({
          transactions: [{ id: `t${Date.now()}`, ...tx }, ...s.transactions],
        })),

      addBill: (bill) =>
        set((s) => ({ bills: [...s.bills, { id: `b${Date.now()}`, ...bill }] })),

      removeBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      addDebt: (debt) =>
        set((s) => ({
          debts: [
            ...s.debts,
            {
              id: `d${Date.now()}`,
              ...debt,
              monthsLeft: debt.monthly > 0 ? Math.ceil(debt.total / debt.monthly) : 0,
            },
          ],
        })),

      removeDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      adjustSalary: (delta) =>
        set((s) => ({
          settings: { ...s.settings, salary: Math.max(0, s.settings.salary + delta) },
        })),

      adjustSavingsGoal: (delta) =>
        set((s) => ({
          settings: { ...s.settings, savingsGoal: Math.max(0, s.settings.savingsGoal + delta) },
        })),

      setUserName: (userName) =>
        set((s) => ({ settings: { ...s.settings, userName } })),

      setStartBalance: (startBalance) =>
        set((s) => ({ settings: { ...s.settings, startBalance } })),

      setMood: (mood) => set({ mood }),

      setPrivacyMode: (on) =>
        set((s) => ({ settings: { ...s.settings, privacyMode: on } })),

      loadSampleData: () =>
        set((s) => ({
          transactions: seedTransactions,
          bills: seedBills,
          debts: seedDebts,
          settings: { ...seedSettings, userName: s.settings.userName || seedSettings.userName },
        })),

      eraseAllData: () =>
        set((s) => ({
          transactions: [],
          bills: [],
          debts: [],
          mood: null,
          settings: { ...FRESH_SETTINGS, userName: s.settings.userName },
        })),
    }),
    {
      name: 'pocket-finance',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        transactions: s.transactions,
        bills: s.bills,
        debts: s.debts,
        settings: s.settings,
      }),
    },
  ),
);
