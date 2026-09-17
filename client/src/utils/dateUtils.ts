export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return formatDateStr(monday);
}

export function getPreviousWeekMonday(startDateStr: string): string {
  const current = parseDate(startDateStr);
  current.setDate(current.getDate() - 7);
  return formatDateStr(current);
}

export function getNextWeekMonday(startDateStr: string): string {
  const current = parseDate(startDateStr);
  current.setDate(current.getDate() + 7);
  return formatDateStr(current);
}

export function formatDayName(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
}

export function formatFullDayName(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' }); // Monday, Tuesday
}

export function formatShortDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Sep 14
}

export function formatWeekRange(startDateStr: string, endDateStr: string): string {
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
}

export function isToday(dateStr: string): boolean {
  const today = formatDateStr(new Date());
  return dateStr === today;
}

export function calculateDurationHours(startTime: string, endTime: string): number {
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);

  let startMin = sH * 60 + sM;
  let endMin = eH * 60 + eM;

  if (endMin <= startMin) {
    endMin += 24 * 60;
  }

  return Math.round(((endMin - startMin) / 60) * 10) / 10;
}
