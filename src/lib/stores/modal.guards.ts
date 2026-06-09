import type { CatalogFormData, ModalFormData } from "@lib/stores/index";

/** Checks if the form is a catalog form */
export function isCatalogFormData(
  form: ModalFormData,
): form is CatalogFormData {
  return "name" in form && "macros" in form;
}
