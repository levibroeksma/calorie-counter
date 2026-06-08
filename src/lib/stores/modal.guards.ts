import type {
  CatalogFormData,
  ModalFormData,
  PreferencesFormData,
} from "@lib/domain/types.js";

export function isCatalogFormData(
  form: ModalFormData,
): form is CatalogFormData {
  return "name" in form && "macros" in form;
}

export function isPreferencesFormData(
  form: ModalFormData,
): form is PreferencesFormData {
  return "targetCalories" in form;
}
