import dayjs from "dayjs";
import "dayjs/locale/nl";
dayjs.locale("nl");

import nl from "@lib/copy/nl";

import { preferencesToMacroTargets } from "@lib/domain/userPreference.service";
import { MACRO_FIELDS } from "@lib/domain/portion.service";

import type { Preferences, TrendSeriesPoint } from "@lib/domain/index";

import type {
  Chart as ChartClass,
  ChartConfiguration,
  ChartData,
  CoreChartOptions,
  LegendItem,
} from "chart.js";

const MACRO_COLORS = {
  calories: "rgb(16, 185, 129)",
  protein: "rgb(59, 130, 246)",
  fibres: "rgb(168, 85, 247)",
  fats: "rgb(245, 158, 11)",
  carbs: "rgb(236, 72, 153)",
} as const;

function withAlpha(rgb: string, alpha: number): string {
  return rgb.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
}

export function formatTrendLabels(series: TrendSeriesPoint[]): string[] {
  return series.map((point) => dayjs(point.date).format("D MMM"));
}

export function buildTrendChartConfig(
  series: TrendSeriesPoint[],
  preferences: Preferences,
): ChartConfiguration<"line"> {
  const labels = formatTrendLabels(series);
  const targets = preferencesToMacroTargets(preferences);
  const pointCount = labels.length;

  const datasets = [];

  for (const field of MACRO_FIELDS) {
    const color = MACRO_COLORS[field];
    const yAxisID = field === "calories" ? "y" : "y1";

    datasets.push({
      label: nl.macros[field],
      data: series.map((point) => point.macros[field] ?? 0),
      yAxisID,
      borderColor: color,
      backgroundColor: withAlpha(color, 0.15),
      tension: 0.25,
      pointRadius: 2,
      pointHoverRadius: 4,
    });

    datasets.push({
      label: `${nl.macros[field]} (${nl.trends.targetSuffix})`,
      data: Array.from({ length: pointCount }, () => targets[field] ?? 0),
      yAxisID,
      borderColor: withAlpha(color, 0.45),
      backgroundColor: "transparent",
      borderDash: [6, 4],
      borderWidth: 1,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      targetLine: true,
    });
  }

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom",
          align: "center",
          labels: {
            color: "#d4d4d8",
            usePointStyle: true,
            pointStyle: "circle",
            filter: (legendItem: LegendItem, chartData: ChartData<"line">) => {
              const index = legendItem.datasetIndex;
              if (index == null) return true;
              const dataset = chartData.datasets[index] as {
                targetLine?: boolean;
              };

              return !dataset?.targetLine;
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          ticks: { color: "#a1a1aa", maxRotation: 0 },
          grid: { color: "rgba(63, 63, 70, 0.5)" },
        },
        y: {
          type: "linear",
          position: "left",
          min: 0,
          title: {
            display: true,
            text: nl.units.kcal,
            color: "#a1a1aa",
          },
          ticks: { color: "#a1a1aa" },
          grid: { color: "rgba(63, 63, 70, 0.5)" },
        },
        y1: {
          type: "linear",
          position: "right",
          min: 0,
          title: {
            display: true,
            text: nl.units.g,
            color: "#a1a1aa",
          },
          ticks: { color: "#a1a1aa" },
          grid: { drawOnChartArea: false },
        },
      },
    },
  };
}

let chartLibraryPromise: Promise<typeof ChartClass> | null = null;

export async function loadChartLibrary(): Promise<typeof ChartClass> {
  if (!chartLibraryPromise) {
    chartLibraryPromise = import("chart.js/auto").then((m) => m.Chart);
  }
  return chartLibraryPromise;
}

/** Reset cached Chart.js module (e.g. after a failed dev HMR load). */
export function resetChartLibraryCache() {
  chartLibraryPromise = null;
}

export function createTrendChart(
  canvas: HTMLCanvasElement,
  config: ChartConfiguration<"line">,
  Chart: typeof ChartClass,
): ChartClass {
  return new Chart(canvas, config);
}

export function updateTrendChart(
  chart: ChartClass,
  config: ChartConfiguration<"line">,
): void {
  chart.data = config.data;
  chart.options = config.options as CoreChartOptions<"line">;
  chart.update();
}
