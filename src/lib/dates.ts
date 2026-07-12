/** Date helpers — all dates are local-time ISO strings (YYYY-MM-DD). */

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Local month as YYYY-MM (used for "paid this month" tracking). */
export function monthISO(): string {
  return todayISO().slice(0, 7);
}

/** ISO date `offset` days before today (offset 0 = today). */
export function daysAgoISO(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return toISO(d);
}

/** "Jul 1" style short date from an ISO string. */
export function niceDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** "Today" / "Yesterday" / "Jul 1" */
export function friendlyDate(iso: string): string {
  if (iso === todayISO()) return 'Today';
  if (iso === daysAgoISO(1)) return 'Yesterday';
  return niceDate(iso);
}

/** Two-letter weekday label ("Su", "Mo", …) for an ISO date. */
export function weekdayLabel(iso: string): string {
  const labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return labels[new Date(`${iso}T00:00:00`).getDay()];
}

/** The 7 ISO dates ending today, oldest first. */
export function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) out.push(daysAgoISO(i));
  return out;
}

/** The 7 ISO dates of the week before that, oldest first. */
export function previous7Days(): string[] {
  const out: string[] = [];
  for (let i = 13; i >= 7; i--) out.push(daysAgoISO(i));
  return out;
}
