import type {
  Macro,
  LocalDate,
  Preferences,
  FoodItem,
  FoodItemInput,
  ReferenceUnit,
  UpdateItemFields,
  ConsumptionDay,
} from "@lib/domain/index";

import type { ModalStore } from "@lib/stores/index";

import type {
  LoadDataPayload,
  CreateItemPayload,
  UpdateItemPayload,
  AddConsumptionPayload,
  RemoveConsumptionPayload,
  EnsureTodayPayload,
  UpdatePreferencesPayload,
} from "@actions/payloads";

/** App store state */
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

/** App store methods */
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

/** App store UI */
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

/** App store type - a union of state and methods */
export type AppStore = AppStoreState & AppStoreMethods;

/** Toast payload */
export type ToastPayload = {
  message: string;
  type: "success" | "error";
};

/** Toast is a union of ToastPayload and a phase */
export type Toast = ToastPayload & {
  phase: "in" | "out";
};

/** Action invoke result */
export type ActionInvokeResult<T = unknown> = {
  data?: T;
  error?: unknown;
};
