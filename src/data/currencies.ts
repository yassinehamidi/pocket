/** Currencies and the regions that suggest them. */

export interface Currency {
  code: string;
  /** Short display symbol, e.g. "DH", "$", "€". */
  symbol: string;
  /** Whether the symbol goes before or after the amount. */
  position: 'prefix' | 'suffix';
  label: string;
}

export const CURRENCIES: Record<string, Currency> = {
  MAD: { code: 'MAD', symbol: 'DH', position: 'suffix', label: 'Moroccan dirham' },
  DZD: { code: 'DZD', symbol: 'DA', position: 'suffix', label: 'Algerian dinar' },
  TND: { code: 'TND', symbol: 'DT', position: 'suffix', label: 'Tunisian dinar' },
  EGP: { code: 'EGP', symbol: 'E£', position: 'prefix', label: 'Egyptian pound' },
  XOF: { code: 'XOF', symbol: 'CFA', position: 'suffix', label: 'West African CFA franc' },
  EUR: { code: 'EUR', symbol: '€', position: 'suffix', label: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', position: 'prefix', label: 'British pound' },
  USD: { code: 'USD', symbol: '$', position: 'prefix', label: 'US dollar' },
  CAD: { code: 'CAD', symbol: '$', position: 'prefix', label: 'Canadian dollar' },
  AED: { code: 'AED', symbol: 'AED', position: 'prefix', label: 'UAE dirham' },
  SAR: { code: 'SAR', symbol: 'SR', position: 'prefix', label: 'Saudi riyal' },
  QAR: { code: 'QAR', symbol: 'QR', position: 'prefix', label: 'Qatari riyal' },
  KWD: { code: 'KWD', symbol: 'KD', position: 'prefix', label: 'Kuwaiti dinar' },
  TRY: { code: 'TRY', symbol: '₺', position: 'prefix', label: 'Turkish lira' },
  NGN: { code: 'NGN', symbol: '₦', position: 'prefix', label: 'Nigerian naira' },
  KES: { code: 'KES', symbol: 'KSh', position: 'prefix', label: 'Kenyan shilling' },
  ZAR: { code: 'ZAR', symbol: 'R', position: 'prefix', label: 'South African rand' },
  INR: { code: 'INR', symbol: '₹', position: 'prefix', label: 'Indian rupee' },
  PKR: { code: 'PKR', symbol: 'Rs', position: 'prefix', label: 'Pakistani rupee' },
  CNY: { code: 'CNY', symbol: '¥', position: 'prefix', label: 'Chinese yuan' },
  JPY: { code: 'JPY', symbol: '¥', position: 'prefix', label: 'Japanese yen' },
  IDR: { code: 'IDR', symbol: 'Rp', position: 'prefix', label: 'Indonesian rupiah' },
  BRL: { code: 'BRL', symbol: 'R$', position: 'prefix', label: 'Brazilian real' },
  MXN: { code: 'MXN', symbol: '$', position: 'prefix', label: 'Mexican peso' },
  AUD: { code: 'AUD', symbol: '$', position: 'prefix', label: 'Australian dollar' },
  CHF: { code: 'CHF', symbol: 'CHF', position: 'prefix', label: 'Swiss franc' },
  SEK: { code: 'SEK', symbol: 'kr', position: 'suffix', label: 'Swedish krona' },
};

export const DEFAULT_CURRENCY = 'MAD';
export const DEFAULT_REGION = 'MA';

export interface Region {
  key: string;
  label: string;
  flag: string;
  currency: string;
}

export const REGIONS: Region[] = [
  { key: 'MA', label: 'Morocco', flag: '🇲🇦', currency: 'MAD' },
  { key: 'DZ', label: 'Algeria', flag: '🇩🇿', currency: 'DZD' },
  { key: 'TN', label: 'Tunisia', flag: '🇹🇳', currency: 'TND' },
  { key: 'EG', label: 'Egypt', flag: '🇪🇬', currency: 'EGP' },
  { key: 'SN', label: 'Senegal', flag: '🇸🇳', currency: 'XOF' },
  { key: 'FR', label: 'France', flag: '🇫🇷', currency: 'EUR' },
  { key: 'ES', label: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  { key: 'DE', label: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  { key: 'IT', label: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  { key: 'GB', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { key: 'US', label: 'United States', flag: '🇺🇸', currency: 'USD' },
  { key: 'CA', label: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  { key: 'AE', label: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  { key: 'SA', label: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
  { key: 'QA', label: 'Qatar', flag: '🇶🇦', currency: 'QAR' },
  { key: 'KW', label: 'Kuwait', flag: '🇰🇼', currency: 'KWD' },
  { key: 'TR', label: 'Türkiye', flag: '🇹🇷', currency: 'TRY' },
  { key: 'NG', label: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { key: 'KE', label: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { key: 'ZA', label: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
  { key: 'IN', label: 'India', flag: '🇮🇳', currency: 'INR' },
  { key: 'PK', label: 'Pakistan', flag: '🇵🇰', currency: 'PKR' },
  { key: 'CN', label: 'China', flag: '🇨🇳', currency: 'CNY' },
  { key: 'JP', label: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  { key: 'ID', label: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
  { key: 'BR', label: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
  { key: 'MX', label: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
  { key: 'AU', label: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  { key: 'CH', label: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  { key: 'SE', label: 'Sweden', flag: '🇸🇪', currency: 'SEK' },
  { key: 'XX', label: 'Somewhere else', flag: '🌍', currency: 'USD' },
];

export function getRegion(key: string | undefined): Region {
  return REGIONS.find((r) => r.key === key) ?? REGIONS[0];
}

export function getCurrency(code: string | undefined): Currency {
  return CURRENCIES[code ?? DEFAULT_CURRENCY] ?? CURRENCIES[DEFAULT_CURRENCY];
}
