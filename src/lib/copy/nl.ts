import type { MacroKeys } from "@lib/domain/types/macro";
/** Dutch (nl-NL) UI copy — single source for all user-visible strings. */

/** The locale of the UI copy. */
export const LOCALE = "nl" as const;

export const nl = {
  app: {
    title: "Calorieën tracker",
  },

  nav: {
    today: "Vandaag",
    trends: "Trends",
    settings: "Instellingen",
    catalog: "Catalogus",
  },

  pages: {
    today: "Vandaag",
    trends: "Trends",
    settings: "Instellingen",
    catalog: "Catalogus",
    login: "Inloggen",
  },

  macros: {
    calories: "Calorieën",
    protein: "Eiwit",
    fibres: "Vezels",
    fats: "Vetten",
    carbs: "Koolhydraten",
  } as Record<MacroKeys, string>,

  units: {
    kcal: "kcal",
    g: "g",
    ml: "ml",
    grams: "gr",
    milliliters: "ml",
  },

  a11y: {
    mainNav: "Hoofdnavigatie",
    close: "Sluiten",
  },

  buttons: {
    add: "Toevoegen",
    save: "Opslaan",
    cancel: "Annuleren",
    remove: "Verwijderen",
    login: "Inloggen",
    quickAddItem: "Nieuw item toevoegen",
    todayLog: "Log van vandaag",
    addCatalogItem: "Item toevoegen",
    edit: "Bewerken",
  },

  auth: {
    password: "Wachtwoord",
    passwordRequired: "Vul je wachtwoord in.",
    loginFailed: "Onjuist wachtwoord.",
  },

  forms: {
    name: "Naam",
    amount: "Hoeveelheid",
    referenceAmount: "Referentiehoeveelheid",
    unit: "Eenheid",
    macros: "Macro's",
    portionPreview: "Voorvertoning",
    searchItem: "Zoek een item…",
    targetsTitle: "Dagelijkse doelen",
  },

  targets: {
    calories: "Doel calorieën (max)",
    protein: "Doel eiwit (min)",
    fibres: "Doel vezels (min)",
    fats: "Doel vetten (min)",
    carbs: "Doel koolhydraten (min)",
  },

  trends: {
    period7: "7 dagen",
    period30: "30 dagen",
    chartTitle: "Macro's over tijd",
    targetSuffix: "doel",
  },

  modals: {
    todayLog: "Log van vandaag",
    quickAdd: "Nieuw item toevoegen",
    catalogAdd: "Item toevoegen",
    catalogEdit: "Item bewerken",
  },

  confirms: {
    removeConsumption: "Deze invoer verwijderen?",
    catalogEdit: "Dit past aan hoe eerdere logs worden berekend.",
  },

  toasts: {
    addedToToday: "Toegevoegd aan vandaag",
    itemCreated: "Item opgeslagen",
    itemUpdated: "Item bijgewerkt",
    preferencesSaved: "Doelen opgeslagen",
    saveFailed: "Opslaan mislukt",
    unauthorized: "Je bent niet ingelogd of je sessie is verlopen.",
  },

  errors: {
    duplicateName: "Er bestaat al een item met deze naam.",
    unitMismatch: "Eenheid komt niet overeen met het geselecteerde item.",
    unknownItem: "Onbekend item",
    invalidPortion: "Ongeldige hoeveelheid.",
  },

  empty: {
    todayLog: "Geen invoeren vandaag.",
    catalog: "Geen items in de catalogus.",
    combobox: "Geen resultaten.",
  },
} as Record<string, Record<string, string>>;

export default nl;
