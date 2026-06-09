import type Alpine from "alpinejs";

import type { AppStore } from "@lib/stores/index";
import type { Preferences } from "@lib/domain/index";

/** Settings page data */
interface SettingsPageData {
  form: Preferences;
  init(): void;
  syncFormFromStore(): void;
  save(): Promise<void>;
}

/** Creates a settings page component */
export default function settingsPage(): Alpine.AlpineComponent<SettingsPageData> {
  return {
    form: {
      targetCalories: 0,
      targetProtein: 0,
      targetFibres: 0,
      targetFats: 0,
      targetCarbs: 0,
    } as Preferences,

    /** Initializes the settings page */
    init() {
      this.syncFormFromStore();

      this.$watch("$store.appStore.hydrated", (ready) => {
        if (ready) {
          this.syncFormFromStore();
        }
      });
    },

    /** Syncs the form from the store */
    syncFormFromStore(): void {
      const { preferences } = this.$store.appStore as AppStore;
      this.form = { ...preferences };
    },

    /** Saves the form */
    async save(): Promise<void> {
      const appStore = this.$store.appStore as AppStore;
      const saved = await appStore.updatePreferences(this.form);
      if (saved) {
        this.syncFormFromStore();
      }
    },
  };
}
