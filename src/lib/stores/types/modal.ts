import type { FoodItemFields, Preferences } from "@lib/domain/index";

export type CatalogFormData = FoodItemFields & { id?: number };

export type PreferencesFormData = Preferences;
export type ModalFormData = CatalogFormData | PreferencesFormData;

/** Modal store */
export interface ModalStore {
  isOpen: boolean;
  activeForm: string | null;
  title: string;
  form: ModalFormData | null;
  _pendingReset: boolean;
  open(
    activeForm: string,
    options: { title?: string; form?: ModalFormData },
  ): void;
  close(): void;
  reset(): void;
  setForm(patch: Partial<ModalFormData>): void;
  init(): void;
}
