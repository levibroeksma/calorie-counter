import type Alpine from "alpinejs";
import type { ModalFormData, ModalStore } from "@lib/stores/types/modal";

/** Creates a modal store */
export default function modalStore(effect: typeof Alpine.effect): ModalStore {
  return {
    isOpen: false,
    activeForm: null,
    title: "",
    form: null,
    _pendingReset: false,

    /** Opens the modal */
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

    /** Closes the modal */
    close(): void {
      this.isOpen = false;
      this._pendingReset = true;
    },

    /** Resets the modal */
    reset(): void {
      this.activeForm = null;
      this.title = "";
      this.form = null;
      this._pendingReset = false;
    },

    /** Sets the form */
    setForm(patch: Partial<ModalFormData>): void {
      this.form = { ...(this.form ?? {}), ...patch } as ModalFormData;
    },

    /** Initializes the modal store */
    init(): void {
      effect(() => {
        if (!this.isOpen && this._pendingReset) {
          this.reset();
        }
      });
    },
  };
}
