/** Core data model for Pocket. */

export type TransactionType = 'in' | 'out';

export type CategoryKey =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'fun'
  | 'health'
  | 'salary'
  | 'freelance'
  | 'gift';

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
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  icon: string;
  /** Local month (YYYY-MM) this bill was last marked paid, if any. */
  lastPaidMonth?: string;
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
}

export interface UserSettings {
  userName: string;
  startBalance: number;
  salary: number;
  savingsGoal: number;
  privacyMode: boolean;
  /** Region key from data/currencies.ts REGIONS (e.g. "MA"). */
  region: string;
  /** ISO currency code from data/currencies.ts CURRENCIES (e.g. "MAD"). */
  currency: string;
}

