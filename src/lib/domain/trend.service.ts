import { getRollingDateWindow, getTodayLocal } from "@lib/data/date.service";
import { sumMacrosForDate } from "@lib/domain/consumption.service";
import type {
  TrendSeriesInput,
  TrendSeriesPoint,
  ConsumptionDay,
  LocalDate,
  FoodItem,
  MacroTotals,
} from "@lib/domain/index";

/** Trend period days */
export const TREND_PERIOD_DAYS = {
  WEEK: 7,
  MONTH: 30,
} as const;

/** Gets the daily macro totals */
export function getDailyMacroTotals(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  date: LocalDate,
): MacroTotals {
  return sumMacrosForDate(items, consumption, date) as MacroTotals;
}

/** Builds a trend series */
export function buildTrendSeries({
  items,
  consumption,
  periodDays,
  endDate = getTodayLocal(),
}: TrendSeriesInput): TrendSeriesPoint[] {
  const dates = getRollingDateWindow(endDate, periodDays);

  return dates.map((date) => ({
    date,
    macros: getDailyMacroTotals(items, consumption, date),
  })) as TrendSeriesPoint[];
}

/** Builds a week trend series */
export function buildWeekTrendSeries(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  endDate: LocalDate,
): TrendSeriesPoint[] {
  return buildTrendSeries({
    items,
    consumption,
    periodDays: TREND_PERIOD_DAYS.WEEK,
    endDate,
  }) as TrendSeriesPoint[];
}

/** Builds a month trend series */
export function buildMonthTrendSeries(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  endDate: LocalDate,
): TrendSeriesPoint[] {
  return buildTrendSeries({
    items,
    consumption,
    periodDays: TREND_PERIOD_DAYS.MONTH,
    endDate,
  }) as TrendSeriesPoint[];
}
