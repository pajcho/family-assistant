/** Re-export date formatting and month helpers from date utils (backward compatibility). */
export { formatDate, addMonth, subtractMonth, getDueDateInMonth } from '~/utils/date';

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
