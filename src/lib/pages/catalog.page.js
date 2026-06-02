import nl, { LOCALE } from '../copy/nl.js';
import { roundForDisplay } from '../domain/portion.service.js';

export default function catalogPage() {
  return {
    search: '',
    editConfirmPending: false,

    get filteredItems() {
      const items = this.$store.appStore.items;
      const query = this.search.trim().toLowerCase();

      if (!query) {
        return [...items].sort((a, b) =>
          a.name.localeCompare(b.name, LOCALE),
        );
      }

      return items
        .filter((item) => item.name.toLowerCase().includes(query))
        .sort((a, b) => a.name.localeCompare(b.name, LOCALE));
    },

    get catalogRows() {
      return this.filteredItems.map((item) => {
        const kcal = roundForDisplay(item.macros?.calories ?? 0);
        return {
          id: item.id,
          line: `${item.name} · ${item.referenceAmount}${item.referenceUnit} · ${kcal} ${nl.units.kcal}`,
        };
      });
    },

    openAdd() {
      this.editConfirmPending = false;
      this.$store.modalStore.open('catalogAdd', {
        title: nl.modals.catalogAdd,
        form: {
          name: '',
          referenceAmount: 100,
          referenceUnit: 'g',
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

    openEditById(id) {
      const item = this.$store.appStore.items.find(
        (candidate) => candidate.id === id,
      );

      if (item) {
        this.openEdit(item);
      }
    },

    openEdit(item) {
      this.editConfirmPending = false;
      this.$store.modalStore.open('catalogEdit', {
        title: nl.modals.catalogEdit,
        form: {
          id: item.id,
          name: item.name,
          referenceAmount: item.referenceAmount,
          referenceUnit: item.referenceUnit,
          macros: { ...item.macros },
        },
      });
    },

    requestCatalogEditSave() {
      this.editConfirmPending = true;
    },

    cancelCatalogEditConfirm() {
      this.editConfirmPending = false;
    },

    async confirmCatalogEditSave() {
      const data = await this.$store.appStore.submitCatalogEdit();

      if (data) {
        this.editConfirmPending = false;
      }
    },
  };
}
