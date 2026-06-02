

export default function modalStore(effect) {
  return {
    isOpen: false,
    activeForm: null,
    title: '',
    form: null,
    _pendingReset: false,

    open(activeForm, options = {}) {
      this.activeForm = activeForm;
      this.title = options.title ?? '';
      this.form = options.form ?? null;
      this._pendingReset = false;
      this.isOpen = true;
    },

    close() {
      this.isOpen = false;
      this._pendingReset = true;
    },

    reset() {
      this.activeForm = null;
      this.title = '';
      this.form = null;
      this._pendingReset = false;
    },

    setForm(patch) {
      this.form = { ...(this.form ?? {}), ...patch };
    },

    init() {
      effect(() => {
        if (!this.isOpen && this._pendingReset) {
          this.reset();
        }
      });
    },
  };
}
