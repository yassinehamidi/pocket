import { Currency, DEFAULT_CURRENCY, getCurrency } from '@/data/currencies';

/**
 * Currency formatting — keeps the design reference's style (rounded,
 * space-separated thousands) but uses the user's selected currency:
 * "3 200 DH", "$3 200", "3 200 €"…
 *
 * The active currency is module state synced from the finance store
 * (setRegion / rehydration), so formatting stays a plain function.
 * Components that display amounts should subscribe to
 * `settings.currency` so they re-render when it changes.
 */
let active: Currency = getCurrency(DEFAULT_CURRENCY);

export function setActiveCurrency(code: string | undefined) {
  active = getCurrency(code);
}

export function fmtMoney(n: number): string {
  const v = Math.round(Math.abs(n));
  const grouped = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return active.position === 'prefix'
    ? `${active.symbol}${grouped}`
    : `${grouped} ${active.symbol}`;
}

/** Signed variant used for "safe to spend" when negative: "-120 DH". */
export function fmtMoneySigned(n: number): string {
  return `${n < 0 ? '-' : ''}${fmtMoney(n)}`;
}

/** The symbol of the active currency ("DH", "$", "€"…). */
export function currencySymbol(): string {
  return active.symbol;
}
