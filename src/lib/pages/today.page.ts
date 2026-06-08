import type Alpine from "alpinejs";
import nl from "@lib/copy/nl.js";
import {
  sumMacrosForDate,
  resolveDayEntries,
} from "@lib/domain/consumption.service.js";
import { buildMacroBarRows } from "@lib/domain/dailyMacroDisplay.service.js";
import { roundForDisplay } from "@lib/domain/portion.service.js";
import type {
  FoodItem,
  AppStore,
  TodayLogRow,
  MacroStat,
  ResolvedConsumptionEntry,
  ModalStore,
} from "@lib/domain/types.js";

interface TodayPageData {
  todayEntries: ResolvedConsumptionEntry[];
  todayLogRows: TodayLogRow[];
  macroStats: MacroStat[];
  comboboxItems: FoodItem[];
  portionPreviewText: string;
  canAddConsumption: boolean;
  openTodayLog(): void;
  openQuickAdd(): void;
}

export default function todayPage(): Alpine.AlpineComponent<TodayPageData> {
  return {
    get todayEntries() {
      const appStore = this.$store.appStore as AppStore;
      return resolveDayEntries(
        appStore.items,
        appStore.consumption,
        appStore.today,
      );
    },

    get todayLogRows(): TodayLogRow[] {
      return this.todayEntries.map((entry: ResolvedConsumptionEntry) => ({
        index: entry.index,
        rowName: entry.displayName ?? nl.errors.unknownItem,
        portionText: `${entry.amount} ${entry.unit}`,
        caloriesText: `${roundForDisplay(entry.macros?.calories ?? 0)} ${nl.units.kcal}`,
      }));
    },

    get macroStats() {
      const appStore = this.$store.appStore as AppStore;
      const achieved = sumMacrosForDate(
        appStore.items,
        appStore.consumption,
        appStore.today,
      );
      const rows = buildMacroBarRows(achieved, appStore.preferences);

      return rows.map((row) => ({
        ...row,
        label: nl.macros[row.key],
      }));
    },

    get comboboxItems() {
      const appStore = this.$store.appStore as AppStore;
      return appStore.getComboboxItems();
    },

    get portionPreviewText() {
      const appStore = this.$store.appStore as AppStore;
      const preview = appStore.getPortionPreview();

      if (!preview) {
        return "";
      }

      const parts = [
        `${nl.macros.calories}: ${preview.calories} ${nl.units.kcal}`,
        `${nl.macros.protein}: ${preview.protein} ${nl.units.g}`,
      ];

      return parts.join(" · ");
    },

    get canAddConsumption() {
      const appStore = this.$store.appStore as AppStore;
      return (
        appStore.ui.comboboxSelectedId != null &&
        appStore.ui.portionAmount != null &&
        appStore.ui.portionAmount >= 1 &&
        !appStore.isSaving
      );
    },

    openTodayLog() {
      const appStore = this.$store.appStore as AppStore;
      appStore.cancelRemoveConsumption();
      const modalStore = this.$store.modalStore as ModalStore;
      modalStore.open("consumption", {
        title: nl.modals.todayLog,
      });
    },

    openQuickAdd() {
      const modalStore = this.$store.modalStore as ModalStore;
      modalStore.open("quickAdd", {
        title: nl.modals.quickAdd,
        form: {
          name: "",
          referenceAmount: 100,
          referenceUnit: "g",
          macros: {
            calories: 0,
            protein: 0,
            fibres: 0,
            fats: 0,
            carbs: 0,
          },
        },
      });
    },
  };
}
