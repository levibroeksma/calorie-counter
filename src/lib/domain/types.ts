import { z } from "astro/zod";
import {
  macrosSchema,
  referenceUnitSchema,
  foodItemFieldsSchema,
  preferencesSchema,
} from "@actions/schemas";

import type { PERSISTENCE } from "@config/environments";

export type MacroInput = z.input<typeof macrosSchema>;

export type Macro = z.output<typeof macrosSchema>;
export type MacroKeys = keyof Macro;
export type MacroTotals = Record<keyof Macro, number | 0>;
export type ReferenceUnit = z.infer<typeof referenceUnitSchema>;

export type FoodItemFields = z.infer<typeof foodItemFieldsSchema>;
export type FoodItem = FoodItemFields & {
  id: number;
};
export type FoodItemInput = z.input<typeof foodItemFieldsSchema>;

export type TrenPeriodDays = {
  WEEK: number;
  MONTH: number;
};

export type TrendSeriesInput = {
  items: FoodItem[];
  consumption: ConsumptionDay[];
  periodDays: number;
  endDate?: LocalDate;
};

export type TrendSeriesPoint = {
  date: LocalDate;
  macros: MacroTotals;
};

export type Preferences = z.infer<typeof preferencesSchema>;

export type ConsumptionEntry = {
  itemId: number;
  amount: number;
  unit: ReferenceUnit;
};

export type TodayLogRow = {
  index: number;
  rowName: string;
  portionText: string;
  caloriesText: string;
};

export type MacroStat = {
  label: string;
  key: "calories" | "protein" | "fibres" | "fats" | "carbs";
  achieved: number;
  target: number;
  targetLabel: string;
  fillClass: string;
};

export type ResolvedConsumptionEntry = ConsumptionEntry & {
  index: number;
  isUnknown: boolean;
  isValid: boolean;
  item: FoodItem | undefined;
  displayName: string | null;
  macros: Macro | null | undefined;
  invalidReason?: PortionInvalidReason;
};

/** Calendar date in local timezone, format YYYY-MM-DD. */
export type LocalDate = string & { readonly __brand: unique symbol };

export type ConsumptionDay = {
  date: LocalDate;
  consumed: ConsumptionEntry[];
};

export type PortionInvalidReason =
  | "missing_item"
  | "invalid_reference_amount"
  | "invalid_amount"
  | "missing_unit"
  | "unit_mismatch";

export type PortionValidationResult =
  | { valid: true; scale: number }
  | { valid: false; reason: PortionInvalidReason };

export type PreferencesValidationResult =
  | { valid: false; errors: ValidationErrorRecord }
  | { valid: true; preferences: Preferences };

export type ScaleMacrosResult =
  | { valid: true; scale: number; macros: Macro }
  | { valid: false; reason: PortionInvalidReason };

export type ValidationErrorRecord = Record<string, string>;

export type FoodItemValidationResult =
  | { valid: false; errors: ValidationErrorRecord }
  | { valid: true; item: FoodItem };

export type LoadDataPayload = {
  items: FoodItem[];
  consumption: ConsumptionDay[];
  preferences: Preferences;
  today: LocalDate;
};

export type EnsureTodayPayload = LoadDataPayload & {
  created: boolean;
};

export type AddConsumptionPayload = {
  today: LocalDate;
  consumption: ConsumptionDay[];
  entry: ConsumptionEntry;
};

export type RemoveConsumptionPayload = {
  today: LocalDate;
  consumption: ConsumptionDay[];
  removedIndex: number;
};

export type CreateItemPayload = {
  item: FoodItem;
  items: FoodItem[];
  consumption: ConsumptionDay[];
  logged: boolean;
};

export type UpdateItemPayload = {
  item: FoodItem;
  items: FoodItem[];
};

export type UpdateItemFields = FoodItemInput & { id: number };

export type UpdatePreferencesPayload = {
  preferences: Preferences;
};

export type AppConfig = {
  name: string;
  version: string;
  description: string;
};

export type Persistence = (typeof PERSISTENCE)[keyof typeof PERSISTENCE];

export type EnvironmentConfig = {
  isProduction: boolean;
  isDevelopment: boolean;
  debug: boolean;
  persistence: Persistence;
  baseUrl: string;
};

export interface DataRepository {
  getItems(): Promise<FoodItem[]>;
  setItems(items: FoodItem[]): Promise<void>;
  getConsumption(): Promise<ConsumptionDay[]>;
  setConsumption(consumption: ConsumptionDay[]): Promise<void>;
  getPreferences(): Promise<Preferences>;
  setPreferences(preferences: Preferences): Promise<void>;
}

export type Cloneable = FoodItem[] | ConsumptionDay[] | Preferences;

export type BlobWriteResult = {
  modified: boolean;
  etag?: string;
};

export type BlobStoreLike = {
  get(key: string, options: { type: "json" }): Promise<unknown>;
  setJSON(key: string, data: unknown): Promise<BlobWriteResult>;
};

///////////////////////////////////////////////////////
// Modal form states
///////////////////////////////////////////////////////

export type CatalogFormData = FoodItemFields & { id?: number };
export type PreferencesFormData = Preferences;
export type ModalFormData = CatalogFormData | PreferencesFormData;

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

export interface AppStoreState {
  items: FoodItem[];
  consumption: ConsumptionDay[];
  preferences: Preferences;
  today: LocalDate;
  hydrated: boolean;
  isLoading: boolean;
  isSaving: boolean;
  ui: AppStoreUI;
  _modalStore: ModalStore | null;
  _toastTimer: ReturnType<typeof setTimeout> | null;
}

export interface AppStoreUI {
  comboboxOpen: boolean;
  comboboxSelectedId: number | null;
  comboboxFilter: string;
  portionAmount: number | null;
  portionUnit: ReferenceUnit;
  confirmRemoveIndex: number | null;
  trendPeriodDays: number;
  toast: Toast | null;
  toastQueue: ToastPayload[];
}

export interface AppStoreMethods {
  applyPayload(data: LoadDataPayload): void;
  hydrate(initial: LoadDataPayload): void;
  loadInitialData(): void;
  getSelectedItem(): FoodItem | null;
  getComboboxItems(): FoodItem[];
  getPortionPreview(): Macro | null;
  showToast(message: string, type: "success" | "error"): void;
  _displayToast(payload: ToastPayload): void;
  showActionError(error: unknown): void;
  _requireWriteToken(): string | null;
  _runWriteAction<T>(
    invoke: () => Promise<ActionInvokeResult<T>>,
  ): Promise<T | null>;
  openCombobox(): void;
  closeCombobox(): void;
  resetCombobox(): void;
  resetPortion(): void;
  selectComboboxItem(itemId: number): void;
  resetAddFlow(): void;
  attachModalStore(modalStore: ModalStore): void;
  submitCatalogAdd(): Promise<CreateItemPayload | null>;
  submitCatalogEdit(): Promise<UpdateItemPayload | null>;
  submitQuickAdd(): Promise<CreateItemPayload | null>;
  loadData(): Promise<LoadDataPayload | null>;
  ensureToday(): Promise<EnsureTodayPayload | null>;
  addConsumptionEntry(): Promise<AddConsumptionPayload | null>;
  askRemoveConsumption(index: number): void;
  cancelRemoveConsumption(): void;
  confirmRemoveConsumption(): Promise<void | null>;
  removeConsumptionAt(index: number): Promise<RemoveConsumptionPayload | null>;
  createItem(
    fields: FoodItemInput,
    options: { logToToday?: boolean; amount?: number; unit?: ReferenceUnit },
  ): Promise<CreateItemPayload | null>;
  updateItem(fields: UpdateItemFields): Promise<UpdateItemPayload | null>;
  updatePreferences(
    targets: Preferences,
  ): Promise<UpdatePreferencesPayload | null>;
}

export type ToastPayload = {
  message: string;
  type: "success" | "error";
};

export type Toast = ToastPayload & {
  phase: "in" | "out";
};

export type AppStore = AppStoreState & AppStoreMethods;

export type ActionInvokeResult<T = unknown> = {
  data?: T;
  error?: unknown;
};
