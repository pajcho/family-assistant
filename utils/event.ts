import { isAfter, isBefore, parseISO } from 'date-fns';
import type { Event } from '~/types/database';

import { parseDate, startOfToday } from './date';

/** True if event has already ended (past date, or today but end_time has passed). endTimeStr in HH:mm or HH:mm:ss. */
export function isEventEnded(event: Event): boolean {
  const now = new Date();
  const todayStart = startOfToday();
  const eventDateStart = parseDate(event.date);
  if (isBefore(eventDateStart, todayStart)) return true;
  if (isAfter(eventDateStart, todayStart)) return false;
  const end = event.end_time ?? '23:59';
  const endDateTime = parseISO(event.date + 'T' + (end.length === 5 ? end + ':00' : end));
  return now >= endDateTime;
}
