import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import type { LocalDate } from "@lib/domain/types.js";
dayjs.extend(customParseFormat);

/** Local calendar date format (`YYYY-MM-DD`). */
export const LOCAL_DATE_FORMAT = "YYYY-MM-DD";

export function parseLocalDate(dateStr: string): Dayjs {
  return dayjs(dateStr, LOCAL_DATE_FORMAT, true);
}

export function formatLocalDate(date = new Date()): LocalDate {
  return dayjs(date).format(LOCAL_DATE_FORMAT) as LocalDate;
}

export function getTodayLocal(reference = new Date()): LocalDate {
  return dayjs(reference).format(LOCAL_DATE_FORMAT) as LocalDate;
}

export function addLocalDays(dateStr: string, days: number): LocalDate {
  return parseLocalDate(dateStr)
    .add(days, "day")
    .format(LOCAL_DATE_FORMAT) as LocalDate;
}

export function getRollingDateWindow(
  endDate: LocalDate,
  dayCount: number,
): LocalDate[] {
  if (dayCount < 1) {
    return [] as LocalDate[];
  }

  const end = parseLocalDate(endDate);

  return Array.from(
    { length: dayCount },
    (_, index) =>
      end
        .subtract(dayCount - 1 - index, "day")
        .format(LOCAL_DATE_FORMAT) as LocalDate,
  );
}

export function hasLocalDateChanged(
  storedDate: LocalDate | undefined,
  now = new Date(),
): boolean {
  if (!storedDate) {
    return true;
  }

  return storedDate !== getTodayLocal(now);
}
