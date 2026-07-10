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
}

export interface Debt {
  id: string;
  name: string;
  total: number;
  monthly: number;
  icon: string;
  monthsLeft: number;
}

export interface UserSettings {
  userName: string;
  startBalance: number;
  salary: number;
  savingsGoal: number;
  privacyMode: boolean;
}

export type Mood = 'great' | 'okay' | 'tight';
