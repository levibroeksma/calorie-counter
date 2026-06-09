import type Alpine from "alpinejs";

import nl from "@lib/copy/nl";

import {
  sumMacrosForDate,
  resolveDayEntries,
} from "@lib/domain/consumption.service";
import { buildMacroBarRows } from "@lib/domain/dailyMacroDisplay.service";
import { roundForDisplay } from "@lib/domain/portion.service";

import type { ResolvedConsumptionEntry, FoodItem } from "@lib/domain/index";
import type { AppStore, ModalStore } from "@lib/stores/index";
import type { TodayLogRow, MacroStat } from "@lib/pages/index";

/** Today page data */
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

/** Creates a today page component */
export default function todayPage(): Alpine.AlpineComponent<TodayPageData> {
  return {
    /** Gets the today entries */
    get todayEntries() {
      const appStore = this.$store.appStore as AppStore;
      return resolveDayEntries(
        appStore.items,
        appStore.consumption,
        appStore.today,
      );
    },

    /** Gets the today log rows */
    get todayLogRows(): TodayLogRow[] {
      return this.todayEntries.map((entry: ResolvedConsumptionEntry) => ({
        index: entry.index,
        rowName: entry.displayName ?? nl.errors.unknownItem,
        portionText: `${entry.amount} ${entry.unit}`,
        caloriesText: `${roundForDisplay(entry.macros?.calories ?? 0)} ${nl.units.kcal}`,
      }));
    },

    /** Gets the macro stats */
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

    /** Gets the combobox items */
    get comboboxItems() {
      const appStore = this.$store.appStore as AppStore;
      return appStore.getComboboxItems();
    },

    /** Gets the portion preview text */
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

    /** Gets the can add consumption */
    get canAddConsumption() {
      const appStore = this.$store.appStore as AppStore;
      return (
        appStore.ui.comboboxSelectedId != null &&
        appStore.ui.portionAmount != null &&
        appStore.ui.portionAmount >= 1 &&
        !appStore.isSaving
      );
    },

    /** Opens the today log */
    openTodayLog() {
      const appStore = this.$store.appStore as AppStore;
      appStore.cancelRemoveConsumption();
      const modalStore = this.$store.modalStore as ModalStore;
      modalStore.open("consumption", {
        title: nl.modals.todayLog,
      });
    },

    /** Opens the quick add */
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
