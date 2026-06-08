import { getRollingDateWindow, getTodayLocal } from "@lib/data/date.service.js";
import { sumMacrosForDate } from "@lib/domain/consumption.service.js";
import type {
  MacroTotals,
  ConsumptionDay,
  LocalDate,
  FoodItem,
  TrendSeriesPoint,
  TrendSeriesInput,
} from "@lib/domain/types.js";

export const TREND_PERIOD_DAYS = {
  WEEK: 7,
  MONTH: 30,
} as const;

export function getDailyMacroTotals(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  date: LocalDate,
): MacroTotals {
  return sumMacrosForDate(items, consumption, date) as MacroTotals;
}

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
