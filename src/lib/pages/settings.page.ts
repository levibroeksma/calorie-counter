import type { AppStore, Preferences } from "@lib/domain/types.js";
import type Alpine from "alpinejs";

interface SettingsPageData {
  form: Preferences;
  init(): void;
  syncFormFromStore(): void;
  save(): Promise<void>;
}
export default function settingsPage(): Alpine.AlpineComponent<SettingsPageData> {
  return {
    form: {
      targetCalories: 0,
      targetProtein: 0,
      targetFibres: 0,
      targetFats: 0,
      targetCarbs: 0,
    } as Preferences,

    init() {
      this.syncFormFromStore();

      this.$watch("$store.appStore.hydrated", (ready) => {
        if (ready) {
          this.syncFormFromStore();
        }
      });
    },

    syncFormFromStore(): void {
      const { preferences } = this.$store.appStore as AppStore;
      this.form = { ...preferences };
    },

    async save(): Promise<void> {
      const appStore = this.$store.appStore as AppStore;
      const saved = await appStore.updatePreferences(this.form);
      if (saved) {
        this.syncFormFromStore();
      }
    },
  };
}
