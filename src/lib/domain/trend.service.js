import { getRollingDateWindow, getTodayLocal } from '../data/date.service.js';
import { sumMacrosForDate } from './consumption.service.js';

export const TREND_PERIOD_DAYS = {
  WEEK: 7,
  MONTH: 30,
};

export function getDailyMacroTotals(items, consumption, date) {
  return sumMacrosForDate(items, consumption, date);
}

export function buildTrendSeries({
  items,
  consumption,
  periodDays,
  endDate = getTodayLocal(),
}) {
  const dates = getRollingDateWindow(endDate, periodDays);

  return dates.map((date) => ({
    date,
    macros: getDailyMacroTotals(items, consumption, date),
  }));
}

export function buildWeekTrendSeries(items, consumption, endDate) {
  return buildTrendSeries({
    items,
    consumption,
    periodDays: TREND_PERIOD_DAYS.WEEK,
    endDate,
  });
}

export function buildMonthTrendSeries(items, consumption, endDate) {
  return buildTrendSeries({
    items,
    consumption,
    periodDays: TREND_PERIOD_DAYS.MONTH,
    endDate,
  });
}
