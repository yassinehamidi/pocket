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

/**
 * Current billing cycle (YYYY-MM) for a bill due on `dueDay` of each month:
 * the month of the most recent due date. Before the due day the cycle is
 * still last month's, so a bill marked paid stays paid until its next due
 * date instead of resetting on the 1st.
 */
export function billCycleISO(dueDay: number): string {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const due = Math.min(Math.max(1, dueDay), daysInMonth);
  const cycle = new Date(now.getFullYear(), now.getMonth(), 1);
  if (now.getDate() < due) cycle.setMonth(cycle.getMonth() - 1);
  return toISO(cycle).slice(0, 7);
}

/** "July 2026" from a YYYY-MM string. */
export function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
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
