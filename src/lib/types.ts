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
  /** Day of the month (1–31) the payment is due, if the user set one. */
  dueDay?: number;
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

/**
 * How a monthly savings challenge holds its money:
 * - 'reserve': the target stays in the balance but safe-to-spend excludes it;
 *   whatever survives until the next payday is banked into the savings pot.
 * - 'lock': the target moves into the savings pot the moment the challenge
 *   starts (pay yourself first).
 */
export type ChallengeMode = 'reserve' | 'lock';

/** One pay-cycle savings challenge ("save X this month"). */
export interface SavingsChallenge {
  /** Pay cycle (YYYY-MM of the payday that opened it) this challenge runs in. */
  cycle: string;
  target: number;
  mode: ChallengeMode;
  /** ISO date, YYYY-MM-DD */
  createdAt: string;
}

/** Outcome of the last finished challenge — shown on Goals until a new one starts. */
export interface ChallengeResult {
  cycle: string;
  target: number;
  /** What actually made it into the savings pot. */
  saved: number;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface UserSettings {
  userName: string;
  startBalance: number;
  /** Expected monthly salary — prefills the payday confirmation, never counted until confirmed. */
  salary: number;
  /** Default monthly savings target — prefills each cycle's challenge. */
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

