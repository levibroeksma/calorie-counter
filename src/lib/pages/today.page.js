import nl from '../copy/nl.js';
import { sumMacrosForDate, resolveDayEntries } from '../domain/consumption.service.js';
import { buildMacroBarRows } from '../domain/dailyMacroDisplay.service.js';
import { roundForDisplay } from '../domain/portion.service.js';

export default function todayPage() {
  return {

    get todayEntries() {
      const store = this.$store.appStore;
      return resolveDayEntries(
        store.items,
        store.consumption,
        store.today,
      );
    },

    get todayLogRows() {
      return this.todayEntries.map((entry) => ({
        index: entry.index,
        rowName: entry.displayName ?? nl.errors.unknownItem,
        portionText: `${entry.amount} ${entry.unit}`,
        caloriesText:
          entry.macros != null
            ? `${roundForDisplay(entry.macros.calories)} ${nl.units.kcal}`
            : '',
      }));
    },

    get macroStats() {
      const store = this.$store.appStore;
      const achieved = sumMacrosForDate(
        store.items,
        store.consumption,
        store.today,
      );
      const rows = buildMacroBarRows(achieved, store.preferences);

      return rows.map((row) => ({
        ...row,
        label: nl.macros[row.key],
      }));
    },

    get comboboxItems() {
      return this.$store.appStore.getComboboxItems();
    },

    get portionPreviewText() {
      const preview = this.$store.appStore.getPortionPreview();

      if (!preview) {
        return '';
      }

      const parts = [
        `${nl.macros.calories}: ${preview.calories} ${nl.units.kcal}`,
        `${nl.macros.protein}: ${preview.protein} ${nl.units.g}`,
      ];

      return parts.join(' · ');
    },

    get canAddConsumption() {
      const store = this.$store.appStore;
      return (
        store.ui.comboboxSelectedId != null &&
        store.ui.portionAmount != null &&
        store.ui.portionAmount >= 1 &&
        !store.isSaving
      );
    },

    openTodayLog() {
      this.$store.appStore.cancelRemoveConsumption();
      this.$store.modalStore.open('consumption', {
        title: nl.modals.todayLog,
      });
    },

    openQuickAdd() {
      this.$store.modalStore.open('quickAdd', {
        title: nl.modals.quickAdd,
        form: {
          name: '',
          referenceAmount: 100,
          referenceUnit: 'g',
          amount: 100,
          unit: 'g',
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
