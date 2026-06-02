import { TREND_PERIOD_DAYS } from '../domain/trend.service.js';

export default function trendsPage() {
  return {
    init() {
      if (
        this.$store.appStore.ui.trendPeriodDays !== TREND_PERIOD_DAYS.WEEK &&
        this.$store.appStore.ui.trendPeriodDays !== TREND_PERIOD_DAYS.MONTH
      ) {
        this.$store.appStore.ui.trendPeriodDays = TREND_PERIOD_DAYS.WEEK;
      }
    },

    get periodDays() {
      return this.$store.appStore.ui.trendPeriodDays;
    },

    setPeriod(days) {
      this.$store.appStore.ui.trendPeriodDays = days;
    },
  };
}
