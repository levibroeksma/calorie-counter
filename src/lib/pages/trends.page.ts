import { TREND_PERIOD_DAYS } from "@lib/domain/trend.service.js";
import type { AppStore } from "@lib/domain/types.js";
import type Alpine from "alpinejs";

interface TrendsPageData {
  init(): void;
  periodDays: number;
  setPeriod(days: number): void;
}

export default function trendsPage(): Alpine.AlpineComponent<TrendsPageData> {
  return {
    init(): void {
      const appStore = this.$store.appStore as AppStore;
      if (
        appStore.ui.trendPeriodDays !== TREND_PERIOD_DAYS.WEEK &&
        appStore.ui.trendPeriodDays !== TREND_PERIOD_DAYS.MONTH
      ) {
        appStore.ui.trendPeriodDays = TREND_PERIOD_DAYS.WEEK;
      }
    },

    get periodDays(): number {
      const appStore = this.$store.appStore as AppStore;
      return appStore.ui.trendPeriodDays;
    },

    setPeriod(days: number): void {
      const appStore = this.$store.appStore as AppStore;
      appStore.ui.trendPeriodDays = days;
    },
  };
}
