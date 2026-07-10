import { Category, CategoryKey } from '@/lib/types';

/** Category definitions — labels and Phosphor icon names from the design reference. */
export const CATEGORIES: Record<CategoryKey, Category> = {
  food: { key: 'food', label: 'Food', icon: 'fork-knife', kind: 'expense' },
  transport: { key: 'transport', label: 'Transport', icon: 'bus', kind: 'expense' },
  shopping: { key: 'shopping', label: 'Shopping', icon: 'shopping-bag', kind: 'expense' },
  bills: { key: 'bills', label: 'Bills', icon: 'receipt', kind: 'expense' },
  fun: { key: 'fun', label: 'Fun', icon: 'game-controller', kind: 'expense' },
  health: { key: 'health', label: 'Health', icon: 'heartbeat', kind: 'expense' },
  salary: { key: 'salary', label: 'Salary', icon: 'bank', kind: 'income' },
  freelance: { key: 'freelance', label: 'Freelance', icon: 'laptop', kind: 'income' },
  gift: { key: 'gift', label: 'Gift', icon: 'gift', kind: 'income' },
};

export const EXPENSE_CATEGORIES: CategoryKey[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'fun',
  'health',
];

export const INCOME_CATEGORIES: CategoryKey[] = ['salary', 'freelance', 'gift'];
