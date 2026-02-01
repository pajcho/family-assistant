/** Serbian date format DD.MM.YYYY */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/** 24-hour time HH:mm */
export function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  return `${h.padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}`;
}

/** RSD amount with symbol */
export function formatAmount(amount: number): string {
  return `${Number(amount).toLocaleString('sr-Latn-RS')} RSD`;
}

/** Add one month to YYYY-MM-DD string. If the day doesn't exist in the next month (e.g. Jan 31 → Feb), returns last day of that month. */
export function addMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const dayBefore = d.getDate();
  d.setMonth(d.getMonth() + 1);
  if (d.getDate() !== dayBefore) {
    d.setDate(0); // last day of previous (target) month
  }
  return d.toISOString().slice(0, 10);
}

/** Subtract one month from YYYY-MM-DD string. If the day doesn't exist in the previous month, returns last day of that month. */
export function subtractMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const dayBefore = d.getDate();
  d.setMonth(d.getMonth() - 1);
  if (d.getDate() !== dayBefore) {
    d.setDate(0); // last day of current (target) month
  }
  return d.toISOString().slice(0, 10);
}
