/** Core data model for Pocket. */

export type TransactionType = 'in' | 'out';

/**
 * Built-in categories use readable keys ('food', 'salary', …); user-created
 * ones get generated keys. Always resolve through getCategory() — a key may
 * reference a category that no longer exists.
 */
export type CategoryKey = string;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryKey;
  reason: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
}

export interface Category {
  key: CategoryKey;
  label: string;
  /** Phosphor icon name (kebab-case, as in the design reference) */
  icon: string;
  kind: 'expense' | 'income';
  /** Accent color (hex) used for icons, chips, and the daily ring segments. */
  color: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  icon: string;
  /** Day of the month (1–31) the bill is due; its paid mark resets on this day. */
  dueDay: number;
  /** Billing cycle (YYYY-MM) this bill was last marked paid, if any. */
  lastPaidMonth?: string;
}

/** One recorded payment towards a debt. */
export interface DebtPayment {
  /** ISO date, YYYY-MM-DD */
  date: string;
  amount: number;
}

export interface Debt {
  id: string;
  name: string;
  /** Amount still owed. */
  total: number;
  monthly: number;
  icon: string;
  monthsLeft: number;
  /** Amount owed when the debt was first added — for progress display. */
  originalTotal: number;
  /** Recorded payments, newest first — drives the monthly history. */
  payments: DebtPayment[];
}

/**
 * One move of money between the spendable balance and the savings pot.
 * Positive amount = put into savings, negative = taken back out.
 */
export interface SavingsEntry {
  id: string;
  amount: number;
  /** ISO date, YYYY-MM-DD */
  date: string;
}

/** Something the user wants to buy — the Budget tab computes affordability. */
export interface Wish {
  id: string;
  name: string;
  price: number;
  /** ISO date, YYYY-MM-DD */
  createdAt: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface UserSettings {
  userName: string;
  startBalance: number;
  salary: number;
  savingsGoal: number;
  privacyMode: boolean;
  /** Day of the month (1–31) the salary arrives — drives wish affordability. */
  salaryDay: number;
  /** Appearance: follow the phone ("system") or force light/dark. */
  themeMode: ThemeMode;
  /** Region key from data/currencies.ts REGIONS (e.g. "MA"). */
  region: string;
  /** ISO currency code from data/currencies.ts CURRENCIES (e.g. "MAD"). */
  currency: string;
}

