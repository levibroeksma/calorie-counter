import type Alpine from "alpinejs";
import type { Chart } from "chart.js";

import {
  buildTrendChartConfig,
  createTrendChart,
  loadChartLibrary,
  resetChartLibraryCache,
  updateTrendChart,
} from "@lib/charts/trendChart.client.js";

import { buildTrendSeries } from "@lib/domain/trend.service.js";
import type { AppStore, TrendSeriesPoint } from "@lib/domain/types.js";

interface TrendChartComponentData {
  init(): void;
  chartRevision: string;
  series: TrendSeriesPoint[];
  ensureChart(): Promise<void>;
  refreshChart(): void;
  destroy(): void;
}

export default function trendChart(): Alpine.AlpineComponent<TrendChartComponentData> {
  let chart: Chart | null = null;
  let ChartLib: typeof Chart | null = null;
  return {
    init(): void {
      this.$nextTick(() => {
        this.ensureChart();
      });

      this.$watch("chartRevision", (): void => {
        this.refreshChart();
      });
    },

    get chartRevision(): string {
      const appStore = this.$store.appStore as AppStore;
      return [
        appStore.today,
        appStore.ui.trendPeriodDays,
        appStore.consumption.length,
        appStore.items.length,
        JSON.stringify(appStore.preferences),
      ].join("|");
    },

    get series(): TrendSeriesPoint[] {
      const appStore = this.$store.appStore as AppStore;
      return buildTrendSeries({
        items: appStore.items,
        consumption: appStore.consumption,
        periodDays: appStore.ui.trendPeriodDays,
        endDate: appStore.today,
      });
    },

    async ensureChart(): Promise<void> {
      const canvas = this.$refs.chartCanvas;
      if (!(canvas instanceof HTMLCanvasElement)) {
        return;
      }

      try {
        if (!ChartLib) {
          ChartLib = await loadChartLibrary();
        }

        const appStore = this.$store.appStore as AppStore;

        const config = buildTrendChartConfig(this.series, appStore.preferences);

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
        console.error("Trend chart failed to load", error);
      }
    },

    refreshChart(): void {
      if (!chart) {
        void this.ensureChart();
        return;
      }

      const appStore = this.$store.appStore as AppStore;

      const config = buildTrendChartConfig(this.series, appStore.preferences);
      updateTrendChart(chart, config);
    },

    destroy(): void {
      chart?.destroy();
      chart = null;
    },
  };
}
