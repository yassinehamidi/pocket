import { Category, CategoryKey } from '@/lib/types';

/**
 * Built-in category definitions — labels and Phosphor icon names from the
 * design reference; each category gets a distinct accent color (the design
 * reference is single-accent, so colors are derived to sit well on both the
 * light and dark palettes).
 *
 * The live list (including user-created categories and color edits) lives in
 * useFinanceStore.categories — these are only the seed/reset defaults.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { key: 'food', label: 'Food', icon: 'fork-knife', kind: 'expense', color: '#ef9f3e' },
  { key: 'transport', label: 'Transport', icon: 'bus', kind: 'expense', color: '#4f8fd0' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping-bag', kind: 'expense', color: '#b06fc9' },
  { key: 'bills', label: 'Bills', icon: 'receipt', kind: 'expense', color: '#38a3a5' },
  { key: 'fun', label: 'Fun', icon: 'game-controller', kind: 'expense', color: '#e26fa5' },
  { key: 'health', label: 'Health', icon: 'heartbeat', kind: 'expense', color: '#e0674f' },
  { key: 'salary', label: 'Salary', icon: 'bank', kind: 'income', color: '#1f9d5a' },
  { key: 'freelance', label: 'Freelance', icon: 'laptop', kind: 'income', color: '#2f9d8f' },
  { key: 'gift', label: 'Gift', icon: 'gift', kind: 'income', color: '#c99b3f' },
];

/** Fallback for transactions whose category was deleted or is unknown. */
const UNKNOWN_CATEGORY: Omit<Category, 'key' | 'kind'> = {
  label: 'Other',
  icon: 'tag',
  color: '#9aa79c',
};

/** Resolves a category key against the live list, with a safe fallback. */
export function getCategory(categories: Category[], key: CategoryKey): Category {
  return (
    categories.find((c) => c.key === key) ?? { key, kind: 'expense', ...UNKNOWN_CATEGORY }
  );
}

/** Swatches offered in the category editor. */
export const CATEGORY_COLORS = [
  '#ef9f3e',
  '#e0674f',
  '#e26fa5',
  '#b06fc9',
  '#7c6fd0',
  '#4f8fd0',
  '#38a3a5',
  '#2f9d8f',
  '#1f9d5a',
  '#7aa338',
  '#c99b3f',
  '#8a6d5a',
  '#6b7670',
] as const;

/** Icons offered in the category editor (must exist in PhosphorIcon's map). */
export const CATEGORY_ICONS = [
  'fork-knife',
  'coffee',
  'bus',
  'car',
  'airplane',
  'shopping-bag',
  't-shirt',
  'receipt',
  'house',
  'lightning',
  'wifi-high',
  'device-mobile',
  'game-controller',
  'film-slate',
  'music-notes',
  'barbell',
  'heartbeat',
  'graduation-cap',
  'book-open',
  'paw-print',
  'baby',
  'hammer',
  'globe',
  'bank',
  'laptop',
  'coins',
  'gift',
  'tag',
] as const;
