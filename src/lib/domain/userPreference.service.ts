import type {
  Preferences,
  PreferencesValidationResult,
  ValidationErrorRecord,
  MacroTotals,
} from "@lib/domain/index";

/** Target fields */
export const TARGET_FIELDS = [
  "targetCalories",
  "targetProtein",
  "targetFibres",
  "targetFats",
  "targetCarbs",
] as const;

/** Checks if a number is non-negative */
function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** Validates preferences */
export function validatePreferences(
  input: unknown,
): PreferencesValidationResult {
  const errors: ValidationErrorRecord = {};

  if (!input || typeof input !== "object") {
    for (const field of TARGET_FIELDS) {
      errors[field] = "required";
    }

    return { valid: false, errors };
  }

  const preferences: Preferences = {
    targetCalories: 0,
    targetProtein: 0,
    targetFibres: 0,
    targetFats: 0,
    targetCarbs: 0,
  } as Preferences;

  for (const field of TARGET_FIELDS) {
    const value = (input as Record<string, unknown>)[field];

    if (!isNonNegativeNumber(value)) {
      errors[field] = "invalid";
    } else {
      preferences[field] = value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, preferences };
}

/** Converts preferences to macro targets */
export function preferencesToMacroTargets(
  preferences: Preferences,
): MacroTotals {
  return {
    calories: preferences.targetCalories,
    protein: preferences.targetProtein,
    fibres: preferences.targetFibres,
    fats: preferences.targetFats,
    carbs: preferences.targetCarbs,
  } as MacroTotals;
}
