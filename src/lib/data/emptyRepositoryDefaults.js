/** Production-safe empty store values (no demo catalog). */

export function getEmptyItems() {
  return [];
}

export function getEmptyConsumption() {
  return [];
}

export function getEmptyPreferences() {
  return {
    targetCalories: 0,
    targetProtein: 0,
    targetFibres: 0,
    targetFats: 0,
    targetCarbs: 0,
  };
}
