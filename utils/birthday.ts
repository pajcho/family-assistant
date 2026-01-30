/** Current age from birth_date (YYYY-MM-DD) */
export function currentAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate + 'T12:00:00');
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Next birthday date (this year or next) */
export function nextBirthdayDate(birthDate: string): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [, month, day] = birthDate.split('-').map(Number);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  return next;
}

/** Days until next birthday */
export function daysUntilBirthday(birthDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = nextBirthdayDate(birthDate);
  const diff = next.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** Display text: "[Name] puni [age] godina za [X] dana" */
export function birthdayDisplayText(name: string, birthDate: string): string {
  const age = currentAge(birthDate);
  const nextAge = age + 1;
  const days = daysUntilBirthday(birthDate);
  const godina = nextAge === 1 ? 'godinu' : nextAge >= 2 && nextAge <= 4 ? 'godine' : 'godina';
  if (days === 0) return `${name} danas puni ${nextAge} ${godina}`;
  if (days === 1) return `${name} sutra puni ${nextAge} ${godina}`;
  return `${name} puni ${nextAge} ${godina} za ${days} dana`;
}
