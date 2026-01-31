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

/** Add one month to YYYY-MM-DD string */
export function addMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

/** Subtract one month from YYYY-MM-DD string */
export function subtractMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}
