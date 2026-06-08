export const MACRO_FIELDS = [
  "calories",
  "protein",
  "fibres",
  "fats",
  "carbs",
] as const;

import type {
  ConsumptionEntry,
  FoodItem,
  Macro,
  PortionValidationResult,
  ReferenceUnit,
  ScaleMacrosResult,
} from "@lib/domain/types";

export function roundForDisplay(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

export function roundMacrosForDisplay(macros: Macro): Macro {
  const rounded = {
    calories: roundForDisplay(macros.calories ?? 0),
    protein: roundForDisplay(macros.protein ?? 0),
    fibres: roundForDisplay(macros.fibres ?? 0),
    fats: roundForDisplay(macros.fats ?? 0),
    carbs: roundForDisplay(macros.carbs ?? 0),
  };

  for (const field of MACRO_FIELDS) {
    rounded[field] = roundForDisplay(macros[field] ?? 0);
  }

  return rounded;
}

export function validatePortion(
  item: FoodItem,
  amount: number,
  unit: ReferenceUnit,
): PortionValidationResult {
  if (!item) {
    return { valid: false, reason: "missing_item" };
  }

  const referenceAmount: number = item.referenceAmount;

  if (
    referenceAmount == null ||
    !Number.isFinite(referenceAmount) ||
    referenceAmount <= 0
  ) {
    return { valid: false, reason: "invalid_reference_amount" };
  }

  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return { valid: false, reason: "invalid_amount" };
  }

  if (!unit || !item.referenceUnit) {
    return { valid: false, reason: "missing_unit" };
  }

  if (unit !== item.referenceUnit) {
    return { valid: false, reason: "unit_mismatch" };
  }

  return { valid: true, scale: amount / referenceAmount };
}

export function getScale(
  item: FoodItem,
  amount: number,
  unit: ReferenceUnit,
): number | null {
  const validation = validatePortion(item, amount, unit);
  return validation.valid ? validation.scale : null;
}

export function scaleMacroValue(macroValue: number, scale: number): number {
  return (macroValue ?? 0) * scale;
}

export function scaleMacros(
  item: FoodItem,
  amount: number,
  unit: ReferenceUnit,
): ScaleMacrosResult {
  const validation = validatePortion(item, amount, unit);

  if (!validation.valid) {
    return { valid: false, reason: validation.reason };
  }

  const source: Macro = item.macros ?? {};

  const macros: Macro = {
    calories: scaleMacroValue(source.calories, validation.scale),
    protein: scaleMacroValue(source.protein, validation.scale),
    fibres: scaleMacroValue(source.fibres, validation.scale),
    fats: scaleMacroValue(source.fats, validation.scale),
    carbs: scaleMacroValue(source.carbs, validation.scale),
  };

  return { valid: true, scale: validation.scale, macros: macros };
}

export function scaleConsumptionEntry(
  item: FoodItem,
  entry: ConsumptionEntry,
): ScaleMacrosResult {
  return scaleMacros(item, entry.amount, entry.unit);
}
