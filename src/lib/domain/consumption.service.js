import {
  MACRO_FIELDS,
  scaleConsumptionEntry,
} from './portion.service.js';

function emptyTotals() {
  return {
    calories: 0,
    protein: 0,
    fibres: 0,
    fats: 0,
    carbs: 0,
  };
}

function addTotals(target, source) {
  for (const field of MACRO_FIELDS) {
    target[field] += source[field] ?? 0;
  }
}

export function buildItemsById(items) {

  const map = new Map();

  for (const item of items) {
    if (item?.id != null) {
      map.set(item.id, item);
    }
  }

  return map;
}

export function findConsumptionDay(consumption, date) {
  if (!Array.isArray(consumption)) {
    return undefined;
  }

  return consumption.find((day) => day?.date === date);
}

export function getConsumedForDate(consumption, date) {
  return findConsumptionDay(consumption, date)?.consumed ?? [];
}

export function getMostRecentlyUsedItemIds(consumption) {
  if (!Array.isArray(consumption)) {
    return [];
  }

  const days = consumption
    .filter((day) => day?.date && Array.isArray(day.consumed))
    .sort((a, b) => b.date.localeCompare(a.date));

  const order = [];
  const seen = new Set();

  for (const day of days) {
    const entries = [...day.consumed].reverse();

    for (const entry of entries) {
      const itemId = entry?.itemId;

      if (itemId == null || seen.has(itemId)) {
        continue;
      }

      seen.add(itemId);
      order.push(itemId);
    }
  }

  return order;
}

export function sortItemsForCombobox(items, consumption, locale = 'nl') {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const byId = buildItemsById(items);
  const mruIds = getMostRecentlyUsedItemIds(consumption);
  const mruSet = new Set(mruIds);

  const mruItems = [];

  for (const id of mruIds) {
    const item = byId.get(id);

    if (item) {
      mruItems.push(item);
    }
  }

  const remaining = items
    .filter((item) => item?.id != null && !mruSet.has(item.id))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  return [...mruItems, ...remaining];
}

export function filterItemsByQuery(items, query, locale = 'nl') {
  const normalized = query?.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalized),
  );
}

export function resolveConsumptionEntry(itemsById, entry, index) {
  const item = itemsById.get(entry.itemId);

  if (!item) {
    return {
      ...entry,
      index,
      isUnknown: true,
      isValid: false,
      item: null,
      displayName: null,
      macros: null,
    };
  }

  const scaled = scaleConsumptionEntry(item, entry);

  if (!scaled.valid) {
    return {
      ...entry,
      index,
      isUnknown: false,
      isValid: false,
      item,
      displayName: item.name,
      macros: null,
      invalidReason: scaled.reason,
    };
  }

  return {
    ...entry,
    index,
    isUnknown: false,
    isValid: true,
    item,
    displayName: item.name,
    macros: scaled.macros,
  };
}

export function resolveDayEntries(items, consumption, date) {
  const itemsById = buildItemsById(items);
  const consumed = getConsumedForDate(consumption, date);

  return consumed.map((entry, index) =>
    resolveConsumptionEntry(itemsById, entry, index),
  );
}

export function sumMacrosForDate(items, consumption, date) {
  const itemsById = buildItemsById(items);
  const consumed = getConsumedForDate(consumption, date);
  const totals = emptyTotals();

  for (const entry of consumed) {
    const item = itemsById.get(entry.itemId);

    if (!item) {
      continue;
    }

    const scaled = scaleConsumptionEntry(item, entry);

    if (!scaled.valid) {
      continue;
    }

    addTotals(totals, scaled.macros);
  }

  return totals;
}
