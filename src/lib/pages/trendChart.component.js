import {
  buildTrendChartConfig,
  createTrendChart,
  loadChartLibrary,
  resetChartLibraryCache,
  updateTrendChart,
} from '../charts/trendChart.client.js';
import { buildTrendSeries, TREND_PERIOD_DAYS } from '../domain/trend.service.js';

export default function trendChart() {
  let chart = null;
  let ChartLib = null;
  return {


    init() {
      this.$nextTick(() => {
        this.ensureChart();
      });

      this.$watch('chartRevision', () => {
        this.refreshChart();
      });
    },

    get chartRevision() {
      const store = this.$store.appStore;
      return [
        store.today,
        store.ui.trendPeriodDays,
        store.consumption.length,
        store.items.length,
        JSON.stringify(store.preferences),
      ].join('|');
    },

    get series() {
      const store = this.$store.appStore;
      return buildTrendSeries({
        items: store.items,
        consumption: store.consumption,
        periodDays: store.ui.trendPeriodDays,
        endDate: store.today,
      });
    },

    async ensureChart() {
      const canvas = this.$refs.chartCanvas;

      if (!canvas) {
        return;
      }

      try {
        if (!ChartLib) {
          ChartLib = await loadChartLibrary();
        }

        const config = buildTrendChartConfig(
          this.series,
          this.$store.appStore.preferences,
        );

        if (chart) {
          updateTrendChart(chart, config);
          return;
        }

        chart = createTrendChart(canvas, config, ChartLib);
      } catch (error) {
        resetChartLibraryCache();
        ChartLib = null;
        chart?.destroy();
        chart = null;
        console.error('Trend chart failed to load', error);
      } 
    },

    refreshChart() {
      if (!chart) {
        void this.ensureChart();
        return;
      }

      const config = buildTrendChartConfig(
        this.series,
        this.$store.appStore.preferences,
      );
      updateTrendChart(chart, config);
    },

    destroy() {
      chart?.destroy();
      chart = null;
    },
  };
}
