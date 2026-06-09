import {
  MACRO_FIELDS,
  scaleConsumptionEntry,
} from "@lib/domain/portion.service";
import type {
  ConsumptionDay,
  ConsumptionEntry,
  FoodItem,
  LocalDate,
  MacroTotals,
} from "@lib/domain/index";

/** Returns an empty macro totals object */
function emptyTotals(): MacroTotals {
  return {
    calories: 0,
    protein: 0,
    fibres: 0,
    fats: 0,
    carbs: 0,
  };
}

/** Adds the values of the source totals to the target totals */
function addTotals(target: MacroTotals, source: MacroTotals) {
  for (const field of MACRO_FIELDS) {
    target[field as keyof MacroTotals] +=
      source[field as keyof MacroTotals] ?? 0;
  }
}

/** Builds a map of items by their id */
export function buildItemsById(items: FoodItem[]) {
  const map = new Map<number, FoodItem>();

  for (const item of items) {
    if (item?.id != null) {
      map.set(item.id, item);
    }
  }

  return map;
}

/** Finds a consumption day by date */
export function findConsumptionDay(
  consumption: ConsumptionDay[],
  date: LocalDate,
): ConsumptionDay | undefined {
  if (!Array.isArray(consumption)) {
    return undefined;
  }

  return consumption.find((day) => day?.date === date);
}

/** Gets the consumed items for a date */
export function getConsumedForDate(
  consumption: ConsumptionDay[],
  date: LocalDate,
): ConsumptionEntry[] {
  return findConsumptionDay(consumption, date)?.consumed ?? [];
}

/** Gets the most recently used item ids */
export function getMostRecentlyUsedItemIds(consumption: ConsumptionDay[]) {
  if (!Array.isArray(consumption)) {
    return [];
  }

  const days: ConsumptionDay[] = consumption
    .filter((day) => day?.date && Array.isArray(day.consumed))
    .sort((a, b) => b.date.localeCompare(a.date));

  const order: number[] = [];
  const seen = new Set<number>();

  for (const day of days) {
    const entries: ConsumptionEntry[] = [...day.consumed].reverse();

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

/** Sorts items for a combobox */
export function sortItemsForCombobox(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  locale = "nl",
) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const byId = buildItemsById(items);
  const mruIds = getMostRecentlyUsedItemIds(consumption);
  const mruSet = new Set(mruIds);

  const mruItems: FoodItem[] = [];

  for (const id of mruIds) {
    const item: FoodItem | undefined = byId.get(id);

    if (item) {
      mruItems.push(item);
    }
  }

  const remaining: FoodItem[] = items
    .filter((item) => item?.id != null && !mruSet.has(item.id))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  return [...mruItems, ...remaining];
}

/** Filters items by a query */
export function filterItemsByQuery(
  items: FoodItem[],
  query: string,
): FoodItem[] {
  const normalized = query?.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

/** Resolves a consumption entry */
export function resolveConsumptionEntry(
  itemsById: Map<number, FoodItem>,
  entry: ConsumptionEntry,
  index: number,
) {
  const item: FoodItem | undefined = itemsById.get(entry.itemId);

  if (!item) {
    return {
      ...entry,
      index,
      isUnknown: true,
      isValid: false,
      item: undefined,
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
      macros: undefined,
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
    macros: scaled.macros ?? undefined,
  };
}

/** Resolves the entries for a day */
export function resolveDayEntries(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  date: LocalDate,
) {
  const itemsById = buildItemsById(items);
  const consumed = getConsumedForDate(consumption, date);

  return consumed.map((entry, index) =>
    resolveConsumptionEntry(itemsById, entry, index),
  );
}

/** Sums the macros for a date, returning a MacroTotals object */
export function sumMacrosForDate(
  items: FoodItem[],
  consumption: ConsumptionDay[],
  date: LocalDate,
) {
  const itemsById = buildItemsById(items);
  const consumed = getConsumedForDate(consumption, date);
  const totals = emptyTotals();

  for (const entry of consumed) {
    const item: FoodItem | undefined = itemsById.get(entry.itemId);

    if (!item) {
      continue;
    }

    const scaled = scaleConsumptionEntry(item, entry);

    if (!scaled.valid) {
      continue;
    }

    addTotals(totals, scaled.macros ?? emptyTotals());
  }

  return totals;
}
