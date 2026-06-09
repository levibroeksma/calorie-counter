import type Alpine from "alpinejs";

import nl, { LOCALE } from "@lib/copy/nl";

import { roundForDisplay } from "@lib/domain/portion.service";

import type { FoodItem } from "@lib/domain/index";
import type { AppStore } from "@lib/stores/index";
import type { UpdateItemPayload } from "@actions/payloads";
import type { ModalStore } from "@lib/stores/types/modal";

/** Catalog page data */
interface CatalogPageData {
  search: string;
  editConfirmPending: boolean;
  filteredItems: FoodItem[];
  catalogRows: { id: number; line: string }[];
  openAdd(): void;
  openEditById(id: number): void;
  openEdit(item: FoodItem): void;
  requestCatalogEditSave(): void;
  cancelCatalogEditConfirm(): void;
  confirmCatalogEditSave(): Promise<void>;
}

/** Creates a catalog page component */
export default function catalogPage(): Alpine.AlpineComponent<CatalogPageData> {
  return {
    search: "" as string,
    editConfirmPending: false as boolean,

    /** Gets the filtered items */
    get filteredItems(): FoodItem[] {
      const items = (this.$store.appStore as AppStore).items;
      const query = this.search.trim().toLowerCase();

      if (!query) {
        return [...items].sort((a, b) => a.name.localeCompare(b.name, LOCALE));
      }

      return items
        .filter((item: FoodItem) => item.name.toLowerCase().includes(query))
        .sort((a: FoodItem, b: FoodItem) =>
          a.name.localeCompare(b.name, LOCALE),
        );
    },

    /** Gets the catalog rows */
    get catalogRows() {
      return this.filteredItems.map((item) => {
        const kcal = roundForDisplay(item.macros?.calories ?? 0);
        return {
          id: item.id,
          line: `${item.name} · ${item.referenceAmount}${item.referenceUnit} · ${kcal} ${nl.units.kcal}`,
        };
      });
    },

    /** Opens the add modal */
    openAdd(): void {
      const modalStore = this.$store.modalStore as ModalStore;
      this.editConfirmPending = false;
      modalStore.open("catalogAdd", {
        title: nl.modals.catalogAdd,
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

    /** Opens the edit modal by id */
    openEditById(id: number): void {
      const appStore = this.$store.appStore as AppStore;
      const item = appStore.items.find(
        (candidate: FoodItem) => candidate.id === id,
      );

      if (item) {
        this.openEdit(item);
      }
    },

    /** Opens the edit modal by item */
    openEdit(item: FoodItem): void {
      const modalStore = this.$store.modalStore as ModalStore;
      this.editConfirmPending = false;
      modalStore.open("catalogEdit", {
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

    /** Requests the catalog edit save */
    requestCatalogEditSave(): void {
      this.editConfirmPending = true;
    },

    /** Cancels the catalog edit confirm */
    cancelCatalogEditConfirm(): void {
      this.editConfirmPending = false;
    },

    /** Confirms the catalog edit save */
    async confirmCatalogEditSave(): Promise<void> {
      const appStore = this.$store.appStore as AppStore;
      const data = (await appStore.submitCatalogEdit()) as UpdateItemPayload;
      if (data) {
        this.editConfirmPending = false;
      }
    },
  };
}
