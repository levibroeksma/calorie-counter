import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

/** Local calendar date format (`YYYY-MM-DD`). */
export const LOCAL_DATE_FORMAT = 'YYYY-MM-DD';

export function parseLocalDate(dateStr) {
  return dayjs(dateStr, LOCAL_DATE_FORMAT, true);
}

export function formatLocalDate(date = new Date()) {
  return dayjs(date).format(LOCAL_DATE_FORMAT);
}

export function getTodayLocal(reference = new Date()) {
  return dayjs(reference).format(LOCAL_DATE_FORMAT);
}

export function addLocalDays(dateStr, days) {
  return parseLocalDate(dateStr).add(days, 'day').format(LOCAL_DATE_FORMAT);
}

export function getRollingDateWindow(endDate, dayCount) {
  if (dayCount < 1) {
    return [];
  }

  const end = parseLocalDate(endDate);

  return Array.from({ length: dayCount }, (_, index) =>
    end.subtract(dayCount - 1 - index, 'day').format(LOCAL_DATE_FORMAT),
  );
}

export function hasLocalDateChanged(storedDate, now = new Date()) {
  if (!storedDate) {
    return true;
  }

  return storedDate !== getTodayLocal(now);
}
