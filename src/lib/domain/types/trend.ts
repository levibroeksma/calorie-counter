import type {
  FoodItem,
  ConsumptionDay,
  LocalDate,
  MacroTotals,
} from "@lib/domain/index";

/** Trend series input */
export type TrendSeriesInput = {
  items: FoodItem[];
  consumption: ConsumptionDay[];
  periodDays: number;
  endDate?: LocalDate;
};

/** Trend series point */
export type TrendSeriesPoint = {
  date: LocalDate;
  macros: MacroTotals;
};

/** Trend period days */
export type TrendPeriodDays = {
  WEEK: number;
  MONTH: number;
};
