import type { ModalFormData, ModalStore } from "@lib/domain/types.js";
import type Alpine from "alpinejs";

export default function modalStore(effect: typeof Alpine.effect): ModalStore {
  return {
    isOpen: false,
    activeForm: null,
    title: "",
    form: null,
    _pendingReset: false,

    open(
      activeForm: string,
      options: { title?: string; form?: ModalFormData } = {},
    ): void {
      this.activeForm = activeForm;
      this.title = options.title ?? "";
      this.form = options.form ?? null;
      this._pendingReset = false;
      this.isOpen = true;
    },

    close(): void {
      this.isOpen = false;
      this._pendingReset = true;
    },

    reset(): void {
      this.activeForm = null;
      this.title = "";
      this.form = null;
      this._pendingReset = false;
    },

    setForm(patch: Partial<ModalFormData>): void {
      this.form = { ...(this.form ?? {}), ...patch } as ModalFormData;
    },

    init(): void {
      effect(() => {
        if (!this.isOpen && this._pendingReset) {
          this.reset();
        }
      });
    },
  };
}
