
export default function settingsPage() {
  return {
    form: {
      targetCalories: 0,
      targetProtein: 0,
      targetFibres: 0,
      targetFats: 0,
      targetCarbs: 0,
    },

    init() {
      this.syncFormFromStore();

      this.$watch('$store.appStore.hydrated', (ready) => {
        if (ready) {
          this.syncFormFromStore();
        }
      });
    },

    syncFormFromStore() {
      const { preferences } = this.$store.appStore;
      this.form = { ...preferences };
    },

    async save() {
      const saved = await this.$store.appStore.updatePreferences(this.form);

      if (saved) {
        this.syncFormFromStore();
      }
    },
  };
}
