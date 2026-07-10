/**
 * Currency formatting — matches the design reference exactly:
 * rounded, space-separated thousands, "DH" suffix (e.g. "3 200 DH").
 */
export function fmtDH(n: number): string {
  const v = Math.round(Math.abs(n));
  return `${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} DH`;
}

/** Signed variant used for "safe to spend" when negative: "-120 DH". */
export function fmtDHSigned(n: number): string {
  return `${n < 0 ? '-' : ''}${fmtDH(n)}`;
}
