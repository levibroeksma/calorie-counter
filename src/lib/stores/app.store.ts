import { actions } from "astro:actions";
import { getWriteToken } from "@lib/auth/session.client.js";
import nl from "@lib/copy/nl.js";
import { getTodayLocal } from "@lib/data/date.service.js";
import {
  filterItemsByQuery,
  sortItemsForCombobox,
} from "@lib/domain/consumption.service.js";
import {
  roundMacrosForDisplay,
  scaleMacros,
} from "@lib/domain/portion.service.js";
import { messageForActionError } from "@lib/stores/actionMessages.js";
import type {
  AppStore,
  LoadDataPayload,
  Macro,
  ActionInvokeResult,
  ToastPayload,
  ModalStore,
  FoodItemInput,
  CreateItemPayload,
  UpdateItemPayload,
  EnsureTodayPayload,
  AddConsumptionPayload,
  RemoveConsumptionPayload,
  UpdateItemFields,
  UpdatePreferencesPayload,
  Preferences,
} from "@lib/domain/types.js";
import { isCatalogFormData } from "@lib/stores/modal.guards.js";
import { getEmptyPreferences } from "@lib/data/emptyRepositoryDefaults.js";

const TOAST_VISIBLE_MS = 2000;
const TOAST_OUT_MS = 200;

export default function appStore(): AppStore {
  return {
    items: [],
    consumption: [],
    preferences: getEmptyPreferences(),
    today: getTodayLocal(),
    hydrated: false,
    isLoading: false,
    isSaving: false,

    ui: {
      comboboxOpen: false,
      comboboxSelectedId: null,
      comboboxFilter: "",
      portionAmount: null,
      portionUnit: "g",
      confirmRemoveIndex: null,
      trendPeriodDays: 7,
      toast: null,
      toastQueue: [],
    },

    _modalStore: null,
    _toastTimer: null,

    applyPayload(data: LoadDataPayload): void {
      if (!data) {
        return;
      }

      if (Array.isArray(data.items)) {
        this.items = structuredClone(data.items);
      }

      if (Array.isArray(data.consumption)) {
        this.consumption = structuredClone(data.consumption);
      }

      if (data.preferences && typeof data.preferences === "object") {
        this.preferences = structuredClone(data.preferences);
      }

      if (data.today) {
        this.today = data.today;
      }
    },

    hydrate(initial: LoadDataPayload): void {
      if (this.hydrated || !initial) {
        return;
      }

      this.applyPayload(initial);
      this.hydrated = true;
    },

    async loadInitialData(): Promise<void> {
      if (this.hydrated) {
        return;
      }

      this.isLoading = true;

      try {
        const data = await this.loadData();

        if (data) {
          this.hydrated = true;
        }
      } finally {
        this.isLoading = false;
      }
    },

    getSelectedItem() {
      if (this.ui.comboboxSelectedId == null) {
        return null;
      }

      return (
        this.items.find((item) => item.id === this.ui.comboboxSelectedId) ??
        null
      );
    },

    getComboboxItems() {
      const sorted = sortItemsForCombobox(this.items, this.consumption);
      return filterItemsByQuery(sorted, this.ui.comboboxFilter);
    },

    getPortionPreview(): Macro | null {
      const item = this.getSelectedItem();
      const amount = this.ui.portionAmount;
      const unit = this.ui.portionUnit;

      if (!item || amount == null) {
        return null;
      }

      const scaled = scaleMacros(item, amount, unit);

      if (!scaled.valid) {
        return null;
      }

      return roundMacrosForDisplay(scaled.macros);
    },

    showToast(message: string, type = "success"): void {
      const payload: ToastPayload = { message, type };

      if (this.ui.toast) {
        this.ui.toastQueue.push(payload);
        return;
      }

      this._displayToast(payload);
    },

    _displayToast(payload: ToastPayload): void {
      this.ui.toast = { ...payload, phase: "in" };

      if (this._toastTimer) {
        clearTimeout(this._toastTimer);
      }

      this._toastTimer = setTimeout(() => {
        if (!this.ui.toast) {
          return;
        }

        this.ui.toast = { ...this.ui.toast, phase: "out" };

        this._toastTimer = setTimeout(() => {
          this._toastTimer = null;
          this.ui.toast = null;
          const next = this.ui.toastQueue.shift();

          if (next) {
            this._displayToast(next);
          }
        }, TOAST_OUT_MS);
      }, TOAST_VISIBLE_MS);
    },

    showActionError(error: unknown): void {
      this.showToast(messageForActionError(error), "error");
    },

    _requireWriteToken(): string | null {
      const token = getWriteToken();

      if (!token) {
        this.showToast(nl.toasts.unauthorized, "error");
        return null;
      }

      return token;
    },

    async _runWriteAction<T>(
      invoke: () => Promise<ActionInvokeResult<T>>,
    ): Promise<T | null> {
      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      this.isSaving = true;

      try {
        const { data, error } = await invoke();

        if (error) {
          this.showActionError(error);
          return null;
        }

        return data ?? null;
      } catch (error) {
        this.showActionError(error);
        return null;
      } finally {
        this.isSaving = false;
      }
    },

    openCombobox(): void {
      this.ui.comboboxOpen = true;
    },

    closeCombobox(): void {
      this.ui.comboboxOpen = false;
    },

    resetCombobox(): void {
      this.ui.comboboxOpen = false;
      this.ui.comboboxFilter = "";
      this.ui.comboboxSelectedId = null;
    },

    resetPortion(): void {
      this.ui.portionAmount = null;
      this.ui.portionUnit = "g";
    },

    selectComboboxItem(itemId: number): void {
      this.ui.comboboxSelectedId = itemId;
      const item = this.items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return;
      }

      this.ui.portionAmount = item.referenceAmount;
      this.ui.portionUnit = item.referenceUnit;
    },

    resetAddFlow(): void {
      this.resetCombobox();
      this.resetPortion();
    },

    attachModalStore(modalStore: ModalStore): void {
      this._modalStore = modalStore;
    },

    async submitCatalogAdd(): Promise<CreateItemPayload | null> {
      const form = this._modalStore?.form;

      if (!form || !isCatalogFormData(form)) {
        return null;
      }

      const data = await this.createItem(
        {
          name: form.name,
          referenceAmount: form.referenceAmount,
          referenceUnit: form.referenceUnit,
          macros: form.macros,
        } as FoodItemInput,
        { logToToday: false },
      );

      if (data) {
        this._modalStore?.close();
      }

      return data;
    },

    async submitCatalogEdit(): Promise<UpdateItemPayload | null> {
      const form = this._modalStore?.form;

      if (!form || !isCatalogFormData(form) || form.id == null) {
        return null;
      }

      const data = await this.updateItem({
        id: form.id,
        name: form.name,
        referenceAmount: form.referenceAmount,
        referenceUnit: form.referenceUnit,
        macros: form.macros,
      });

      if (data) {
        this._modalStore?.close();
      }

      return data;
    },

    async submitQuickAdd(): Promise<CreateItemPayload | null> {
      const form = this._modalStore?.form;

      if (!form || !isCatalogFormData(form)) {
        return null;
      }

      const amount = form.referenceAmount;
      if (typeof amount !== "number") return null;

      const data = await this.createItem(
        {
          name: form.name,
          referenceAmount: form.referenceAmount,
          referenceUnit: form.referenceUnit,
          macros: form.macros,
        },
        {
          logToToday: true,
          amount,
          unit: form.referenceUnit,
        },
      );

      if (data) {
        this._modalStore?.close();
      }

      return data;
    },

    async loadData(): Promise<LoadDataPayload | null> {
      const { data, error } = await actions.loadData();

      if (error) {
        this.showActionError(error);
        return null;
      }

      if (data) {
        this.applyPayload(data);
      }

      return data ?? null;
    },

    async ensureToday(): Promise<EnsureTodayPayload | null> {
      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      return this._runWriteAction(() =>
        actions.ensureToday({ writeToken }),
      ).then((data) => {
        if (!data) {
          return null;
        }

        this.items = data.items;
        this.consumption = data.consumption;
        this.preferences = data.preferences;
        this.today = data.today;

        return data;
      });
    },

    async addConsumptionEntry(): Promise<AddConsumptionPayload | null> {
      const item = this.getSelectedItem();
      const amount = this.ui.portionAmount;
      const unit = this.ui.portionUnit;

      if (!item || amount == null) {
        return null;
      }

      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      const data = await this._runWriteAction(() =>
        actions.addConsumption({
          writeToken,
          itemId: item.id,
          amount,
          unit,
        }),
      );

      if (!data) {
        return null;
      }

      this.consumption = data.consumption;
      this.today = data.today;

      this.showToast(nl.toasts.addedToToday, "success");
      this.resetAddFlow();

      return data as AddConsumptionPayload;
    },

    askRemoveConsumption(index: number): void {
      this.ui.confirmRemoveIndex = index;
    },

    cancelRemoveConsumption(): void {
      this.ui.confirmRemoveIndex = null;
    },

    async confirmRemoveConsumption(): Promise<void | null> {
      const index = this.ui.confirmRemoveIndex;

      if (index == null) {
        return;
      }

      await this.removeConsumptionAt(index);
      this.ui.confirmRemoveIndex = null;
    },

    async removeConsumptionAt(
      index: number,
    ): Promise<RemoveConsumptionPayload | null> {
      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      const data = await this._runWriteAction(() =>
        actions.removeConsumption({ writeToken, index }),
      );

      if (!data) {
        return null;
      }

      this.consumption = data.consumption;
      this.today = data.today;
      return data as RemoveConsumptionPayload;
    },

    async createItem(fields, options = {}) {
      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      const data = await this._runWriteAction(() =>
        actions.createItem({
          writeToken,
          ...fields,
          logToToday: options.logToToday ?? false,
          amount: options.amount,
          unit: options.unit,
        }),
      );

      if (!data) {
        return null;
      }

      this.items = data.items;

      this.consumption = data.consumption;
      this.showToast(
        options.logToToday ? nl.toasts.addedToToday : nl.toasts.itemCreated,
        "success",
      );

      if (options.logToToday) {
        this.resetAddFlow();
      }

      return data as CreateItemPayload;
    },

    async updateItem(
      fields: UpdateItemFields,
    ): Promise<UpdateItemPayload | null> {
      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      const data = await this._runWriteAction(() =>
        actions.updateItem({
          writeToken,
          ...fields,
        }),
      );

      if (!data) {
        return null;
      }

      this.items = data.items;
      this.showToast(nl.toasts.itemUpdated, "success");
      return data as UpdateItemPayload;
    },

    async updatePreferences(
      targets: Preferences,
    ): Promise<UpdatePreferencesPayload | null> {
      const writeToken = this._requireWriteToken();
      if (!writeToken) return null;

      const data = await this._runWriteAction<UpdatePreferencesPayload>(() =>
        actions.updatePreferences({ writeToken, ...targets }),
      );

      if (!data) {
        return null;
      }

      this.preferences = data.preferences;
      this.showToast(nl.toasts.preferencesSaved, "success");
      return data as UpdatePreferencesPayload;
    },
  };
}
