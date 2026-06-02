import { actions } from 'astro:actions';
import { getWriteToken } from '../auth/session.client.js';
import nl, { LOCALE } from '../copy/nl.js';
import { getTodayLocal } from '../data/date.service.js';
import {
  filterItemsByQuery,
  sortItemsForCombobox,
} from '../domain/consumption.service.js';
import {
  roundMacrosForDisplay,
  scaleMacros,
} from '../domain/portion.service.js';
import { messageForActionError } from './actionMessages.js';

const TOAST_VISIBLE_MS = 2000;
const TOAST_OUT_MS = 200;

export default function appStore() {
  return {
    items: [],
    consumption: [],
    preferences: {},
    today: getTodayLocal(),
    hydrated: false,
    isLoading: false,
    isSaving: false,

    ui: {
      comboboxOpen: false,
      comboboxSelectedId: null,
      comboboxFilter: '',
      portionAmount: null,
      portionUnit: 'g',
      confirmRemoveIndex: null,
      trendPeriodDays: 7,
      toast: null,
      toastQueue: [],
    },

    _modalStore: null,

    _toastTimer: null,

    applyPayload(data) {
      if (!data) {
        return;
      }

      if (Array.isArray(data.items)) {
        this.items = structuredClone(data.items);
      }

      if (Array.isArray(data.consumption)) {
        this.consumption = structuredClone(data.consumption);
      }

      if (data.preferences && typeof data.preferences === 'object') {
        this.preferences = structuredClone(data.preferences);
      }

      if (data.today) {
        this.today = data.today;
      }
    },

    hydrate(initial) {
      if (this.hydrated || !initial) {
        return;
      }

      this.applyPayload(initial);
      this.hydrated = true;
    },

    async loadInitialData() {
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
      const sorted = sortItemsForCombobox(
        this.items,
        this.consumption,
        LOCALE,
      );
      return filterItemsByQuery(sorted, this.ui.comboboxFilter, LOCALE);
    },

    getPortionPreview() {
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

    showToast(message, type = 'success') {
      const payload = { message, type };

      if (this.ui.toast) {
        this.ui.toastQueue.push(payload);
        return;
      }

      this._displayToast(payload);
    },

    _displayToast(payload) {
      this.ui.toast = { ...payload, phase: 'in' };

      if (this._toastTimer) {
        clearTimeout(this._toastTimer);
      }

      this._toastTimer = setTimeout(() => {
        if (!this.ui.toast) {
          return;
        }

        this.ui.toast = { ...this.ui.toast, phase: 'out' };

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

    showActionError(error) {
      this.showToast(messageForActionError(error), 'error');
    },

    _requireWriteToken() {
      const token = getWriteToken();

      if (!token) {
        this.showToast(nl.toasts.unauthorized, 'error');
        return null;
      }

      return token;
    },

    async _runWriteAction(invoke) {
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

    openCombobox() {
      this.ui.comboboxOpen = true;
    },

    closeCombobox() {
      this.ui.comboboxOpen = false;
    },

    resetCombobox() {
      this.ui.comboboxOpen = false;
      this.ui.comboboxFilter = '';
      this.ui.comboboxSelectedId = null;
    },

    resetPortion() {
      this.ui.portionAmount = null;
      this.ui.portionUnit = 'g';
    },

    selectComboboxItem(itemId) {
      this.ui.comboboxSelectedId = itemId;
      const item = this.items.find((candidate) => candidate.id === itemId);

      if (!item) {
        return;
      }

      this.ui.portionAmount = item.referenceAmount;
      this.ui.portionUnit = item.referenceUnit;
    },

    resetAddFlow() {
      this.resetCombobox();
      this.resetPortion();
    },

    attachModalStore(modalStore) {
      this._modalStore = modalStore;
    },

    async submitCatalogAdd() {
      const form = this._modalStore?.form;

      if (!form || typeof form !== 'object') {
        return null;
      }

      const data = await this.createItem(
        {
          name: form.name,
          referenceAmount: form.referenceAmount,
          referenceUnit: form.referenceUnit,
          macros: form.macros,
        },
        { logToToday: false },
      );

      if (data) {
        this._modalStore?.close();
      }

      return data;
    },

    async submitCatalogEdit() {
      const form = this._modalStore?.form;

      if (!form || typeof form !== 'object' || form.id == null) {
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

    async submitQuickAdd() {
      const form = this._modalStore?.form;

      if (!form || typeof form !== 'object') {
        return null;
      }

      const data = await this.createItem(
        {
          name: form.name,
          referenceAmount: form.referenceAmount,
          referenceUnit: form.referenceUnit,
          macros: form.macros,
        },
        {
          logToToday: true,
          amount: form.amount,
          unit: form.unit,
        },
      );

      if (data) {
        this._modalStore?.close();
      }

      return data;
    },

    async loadData() {
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

    async ensureToday() {
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

    async addConsumptionEntry() {
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
      console.log('data in addConsumptionEntry()', data);
      this.showToast(nl.toasts.addedToToday, 'success');
      this.resetAddFlow();
      return data;
    },

    askRemoveConsumption(index) {
      this.ui.confirmRemoveIndex = index;
    },

    cancelRemoveConsumption() {
      this.ui.confirmRemoveIndex = null;
    },

    async confirmRemoveConsumption() {
      const index = this.ui.confirmRemoveIndex;

      if (index == null) {
        return;
      }

      await this.removeConsumptionAt(index);
      this.ui.confirmRemoveIndex = null;
    },

    async removeConsumptionAt(index) {
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
      return data;
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

      console.log('data consumption', data);
      this.consumption = data.consumption;
      this.showToast(
        options.logToToday ? nl.toasts.addedToToday : nl.toasts.itemCreated,
        'success',
      );

      if (options.logToToday) {
        this.resetAddFlow();
      }

      return data;
    },

    async updateItem(fields) {
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
      this.showToast(nl.toasts.itemUpdated, 'success');
      return data;
    },

    async updatePreferences(targets) {
      const writeToken = this._requireWriteToken();

      if (!writeToken) {
        return null;
      }

      const data = await this._runWriteAction(() =>
        actions.updatePreferences({
          writeToken,
          ...targets,
        }),
      );

      if (!data) {
        return null;
      }

      this.preferences = data.preferences;
      this.showToast(nl.toasts.preferencesSaved, 'success');
      return data;
    },
  };
}
