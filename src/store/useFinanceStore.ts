import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CATEGORIES } from '@/data/categories';
import { DEFAULT_CURRENCY, DEFAULT_REGION, getRegion } from '@/data/currencies';
import { seedBills, seedDebts, seedSavings, seedSettings, seedTransactions, seedWishes } from '@/data/seed';
import { billCycleISO, todayISO } from '@/lib/dates';
import { setActiveCurrency } from '@/lib/format';
import {
  Bill,
  Category,
  CategoryKey,
  Debt,
  ThemeMode,
  Transaction,
  TransactionType,
  SavingsEntry,
  UserSettings,
  Wish,
} from '@/lib/types';

const FRESH_SETTINGS: UserSettings = {
  userName: '',
  startBalance: 0,
  salary: 0,
  savingsGoal: 0,
  privacyMode: false,
  salaryDay: 1,
  themeMode: 'system',
  region: DEFAULT_REGION,
  currency: DEFAULT_CURRENCY,
};

interface FinanceState {
  transactions: Transaction[];
  bills: Bill[];
  debts: Debt[];
  /** All categories — built-in defaults plus user-created ones. */
  categories: Category[];
  /** Things the user wants to buy (Budget → Wishlist). */
  wishes: Wish[];
  /** Moves between the spendable balance and the savings pot. */
  savings: SavingsEntry[];
  settings: UserSettings;

  /** Creates a category and returns its generated key. */
  addCategory: (input: {
    label: string;
    icon: string;
    color: string;
    kind: 'expense' | 'income';
  }) => string;
  /** Updates a category's label, icon, or color (built-in or custom). */
  updateCategory: (
    key: CategoryKey,
    patch: Partial<Pick<Category, 'label' | 'icon' | 'color'>>,
  ) => void;
  addTransaction: (tx: {
    type: TransactionType;
    amount: number;
    category: CategoryKey;
    reason: string;
    date: string;
  }) => void;
  addBill: (bill: { name: string; amount: number; icon: string; dueDay: number }) => void;
  removeBill: (id: string) => void;
  /**
   * Marks a bill paid for its current cycle (or unpaid if already marked).
   * Paying records an expense transaction so the balance drops; unpaying
   * removes that transaction again.
   */
  toggleBillPaid: (id: string) => void;
  addDebt: (debt: { name: string; total: number; monthly: number; icon: string }) => void;
  removeDebt: (id: string) => void;
  /** Reduces a debt's remaining balance by one monthly payment. */
  recordDebtPayment: (id: string) => void;
  addWish: (wish: { name: string; price: number }) => void;
  removeWish: (id: string) => void;
  /** Buys a wish: records the expense (drops the balance) and removes it. */
  buyWish: (id: string) => void;
  /** Sets the day of month (1–31) the salary arrives. */
  setSalaryDay: (day: number) => void;
  /** Moves money from the spendable balance into the savings pot. */
  depositSavings: (amount: number) => void;
  /** Takes money back out of the savings pot into the balance. */
  withdrawSavings: (amount: number) => void;
  adjustSalary: (delta: number) => void;
  adjustSavingsGoal: (delta: number) => void;
  setSalary: (salary: number) => void;
  setSavingsGoal: (savingsGoal: number) => void;
  setUserName: (userName: string) => void;
  setStartBalance: (startBalance: number) => void;
  /** Sets the user's region and switches the app currency to match it. */
  setRegion: (regionKey: string) => void;
  setPrivacyMode: (on: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
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
      categories: DEFAULT_CATEGORIES,
      wishes: [],
      savings: [],
      settings: FRESH_SETTINGS,

      addCategory: (input) => {
        const key = `c${Date.now()}`;
        set((s) => ({ categories: [...s.categories, { key, ...input }] }));
        return key;
      },

      updateCategory: (key, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.key === key ? { ...c, ...patch } : c)),
        })),

      addTransaction: (tx) =>
        set((s) => ({
          transactions: [{ id: `t${Date.now()}`, ...tx }, ...s.transactions],
        })),

      addBill: (bill) =>
        set((s) => ({ bills: [...s.bills, { id: `b${Date.now()}`, ...bill }] })),

      removeBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      toggleBillPaid: (id) =>
        set((s) => {
          const bill = s.bills.find((b) => b.id === id);
          if (!bill) return {};
          const cycle = billCycleISO(bill.dueDay);
          const paid = bill.lastPaidMonth === cycle;
          // Deterministic id so unpaying can find and remove the transaction.
          const txId = `bill-${id}-${cycle}`;
          return {
            bills: s.bills.map((b) =>
              b.id === id ? { ...b, lastPaidMonth: paid ? undefined : cycle } : b,
            ),
            transactions: paid
              ? s.transactions.filter((t) => t.id !== txId)
              : [
                  {
                    id: txId,
                    type: 'out' as const,
                    amount: bill.amount,
                    category: 'bills' as const,
                    reason: bill.name,
                    date: todayISO(),
                  },
                  ...s.transactions,
                ],
          };
        }),

      addDebt: (debt) =>
        set((s) => ({
          debts: [
            ...s.debts,
            {
              id: `d${Date.now()}`,
              ...debt,
              originalTotal: debt.total,
              monthsLeft: debt.monthly > 0 ? Math.ceil(debt.total / debt.monthly) : 0,
              payments: [],
            },
          ],
        })),

      removeDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      recordDebtPayment: (id) =>
        set((s) => ({
          debts: s.debts.map((d) => {
            if (d.id !== id) return d;
            const paid = Math.min(d.total, d.monthly);
            const total = d.total - paid;
            return {
              ...d,
              total,
              monthsLeft: d.monthly > 0 ? Math.ceil(total / d.monthly) : 0,
              payments: [{ date: todayISO(), amount: paid }, ...d.payments],
            };
          }),
        })),

      addWish: (wish) =>
        set((s) => ({
          wishes: [...s.wishes, { id: `w${Date.now()}`, createdAt: todayISO(), ...wish }],
        })),

      removeWish: (id) =>
        set((s) => ({ wishes: s.wishes.filter((w) => w.id !== id) })),

      buyWish: (id) =>
        set((s) => {
          const wish = s.wishes.find((w) => w.id === id);
          if (!wish) return {};
          return {
            wishes: s.wishes.filter((w) => w.id !== id),
            transactions: [
              {
                id: `wish-${id}`,
                type: 'out' as const,
                amount: wish.price,
                category: 'shopping',
                reason: wish.name,
                date: todayISO(),
              },
              ...s.transactions,
            ],
          };
        }),

      depositSavings: (amount) =>
        set((s) => ({
          savings: [{ id: `s${Date.now()}`, amount: Math.abs(amount), date: todayISO() }, ...s.savings],
        })),

      withdrawSavings: (amount) =>
        set((s) => ({
          savings: [
            { id: `s${Date.now()}`, amount: -Math.abs(amount), date: todayISO() },
            ...s.savings,
          ],
        })),

      setSalaryDay: (day) =>
        set((s) => ({
          settings: {
            ...s.settings,
            salaryDay: Math.min(31, Math.max(1, Math.round(day) || 1)),
          },
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

      setThemeMode: (mode) =>
        set((s) => ({ settings: { ...s.settings, themeMode: mode } })),

      loadSampleData: () =>
        set((s) => ({
          transactions: seedTransactions,
          bills: seedBills,
          debts: seedDebts,
          wishes: seedWishes,
          savings: seedSavings,
          // Sample data uses built-in category keys — restore any the user is
          // missing, but keep their customs and color edits.
          categories: [
            ...s.categories,
            ...DEFAULT_CATEGORIES.filter((d) => !s.categories.some((c) => c.key === d.key)),
          ],
          settings: {
            ...seedSettings,
            userName: s.settings.userName || seedSettings.userName,
            region: s.settings.region,
            currency: s.settings.currency,
            themeMode: s.settings.themeMode,
          },
        })),

      eraseAllData: () =>
        set((s) => ({
          transactions: [],
          bills: [],
          debts: [],
          wishes: [],
          savings: [],
          categories: DEFAULT_CATEGORIES,
          settings: {
            ...FRESH_SETTINGS,
            userName: s.settings.userName,
            region: s.settings.region,
            currency: s.settings.currency,
            themeMode: s.settings.themeMode,
          },
        })),
    }),
    {
      name: 'pocket-finance',
      storage: createJSONStorage(() => AsyncStorage),
      version: 7,
      migrate: (persisted: unknown) => {
        // v0 → v1: settings gained region/currency.
        // v1 → v2: debts gained originalTotal (assume current total).
        // v2 → v3: bills gained dueDay (assume the 1st), debts gained payments.
        // v3 → v4: settings gained themeMode (defaults to "system" via FRESH_SETTINGS).
        // v4 → v5: categories moved into the store (colored, user-editable).
        // v5 → v6: wishes added; settings gained salaryDay (default 1 via FRESH_SETTINGS).
        // v6 → v7: savings pot entries added.
        const state = persisted as {
          settings?: Partial<UserSettings>;
          bills?: Bill[];
          debts?: Debt[];
          categories?: Category[];
          wishes?: Wish[];
          savings?: SavingsEntry[];
        };
        if (!state.categories || state.categories.length === 0) {
          state.categories = DEFAULT_CATEGORIES;
        }
        state.wishes = state.wishes ?? [];
        state.savings = state.savings ?? [];
        if (state?.settings) {
          state.settings = { ...FRESH_SETTINGS, ...state.settings };
        }
        if (state?.bills) {
          state.bills = state.bills.map((b) => ({ ...b, dueDay: b.dueDay ?? 1 }));
        }
        if (state?.debts) {
          state.debts = state.debts.map((d) => ({
            ...d,
            originalTotal: d.originalTotal ?? d.total,
            payments: d.payments ?? [],
          }));
        }
        return state;
      },
      partialize: (s) => ({
        transactions: s.transactions,
        bills: s.bills,
        debts: s.debts,
        categories: s.categories,
        wishes: s.wishes,
        savings: s.savings,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        setActiveCurrency(state?.settings.currency);
      },
    },
  ),
);
