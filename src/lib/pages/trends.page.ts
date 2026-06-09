import type Alpine from "alpinejs";

import type { AppStore } from "@lib/stores/index";
import { TREND_PERIOD_DAYS } from "@lib/domain/trend.service";

/** Trends page data */
interface TrendsPageData {
  init(): void;
  periodDays: number;
  setPeriod(days: number): void;
}

/** Creates a trends page component */
export default function trendsPage(): Alpine.AlpineComponent<TrendsPageData> {
  return {
    /** Initializes the trends page */
    init(): void {
      const appStore = this.$store.appStore as AppStore;
      if (
        appStore.ui.trendPeriodDays !== TREND_PERIOD_DAYS.WEEK &&
        appStore.ui.trendPeriodDays !== TREND_PERIOD_DAYS.MONTH
      ) {
        appStore.ui.trendPeriodDays = TREND_PERIOD_DAYS.WEEK;
      }
    },

    /** Gets the period days */
    get periodDays(): number {
      const appStore = this.$store.appStore as AppStore;
      return appStore.ui.trendPeriodDays;
    },

    /** Sets the period days */
    setPeriod(days: number): void {
      const appStore = this.$store.appStore as AppStore;
      appStore.ui.trendPeriodDays = days;
    },
  };
}
