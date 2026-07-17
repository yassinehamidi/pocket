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

/**
 * Current pay cycle (YYYY-MM): the month of the most recent payday. Before
 * the pay day the cycle is still last month's — same rule as bill cycles.
 */
export function salaryCycleISO(salaryDay: number): string {
  return billCycleISO(salaryDay);
}

/** ISO date of the most recent payday (the one that opened the current cycle). */
export function lastSalaryISO(salaryDay: number): string {
  const cycle = salaryCycleISO(salaryDay);
  const [y, m] = cycle.split('-').map(Number);
  const day = Math.min(Math.max(1, salaryDay), new Date(y, m, 0).getDate());
  return `${cycle}-${`${day}`.padStart(2, '0')}`;
}

/**
 * ISO date of the next salary for a pay day-of-month. If today is on or past
 * the pay day, the next one is next month's. Pay days beyond a month's length
 * clamp to its last day (e.g. day 31 in February).
 */
export function nextSalaryISO(salaryDay: number): string {
  const now = new Date();
  const dayIn = (y: number, m: number) =>
    Math.min(Math.max(1, salaryDay), new Date(y, m + 1, 0).getDate());
  let y = now.getFullYear();
  let m = now.getMonth();
  if (now.getDate() >= dayIn(y, m)) {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return toISO(new Date(y, m, dayIn(y, m)));
}

/** Whole days from today until an ISO date (0 = today, negative = past). */
export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(`${todayISO()}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
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
