import type { ConsumptionDay, FoodItem, Preferences } from "@lib/domain/index";

/** Production-safe empty store values (no demo items). */
export function getEmptyItems(): FoodItem[] {
  return [] as FoodItem[];
}

/** Production-safe empty store values (no demo consumption). */
export function getEmptyConsumption(): ConsumptionDay[] {
  return [] as ConsumptionDay[];
}

/** Production-safe empty store values (no demo preferences). */
export function getEmptyPreferences(): Preferences {
  return {
    targetCalories: 0,
    targetProtein: 0,
    targetFibres: 0,
    targetFats: 0,
    targetCarbs: 0,
  } as Preferences;
}
