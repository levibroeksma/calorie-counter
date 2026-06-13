import type {
  PortionValidationResult,
  ConsumptionEntry,
  FoodItem,
  ReferenceUnit,
  Macro,
  ScaleMacrosResult,
  MacroKeys,
} from "@lib/domain/index";

/** Macro fields */
export const MACRO_FIELDS: readonly MacroKeys[] = [
  "calories",
  "protein",
  "fibres",
  "fats",
  "carbs",
];

/** Rounds a value for display */
export function roundForDisplay(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

/** Rounds macros for display */
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

/** Validates a portion returns a validation result */
export function validatePortion(
  item: FoodItem,
  amount: number,
  unit: ReferenceUnit,
): PortionValidationResult {
  if (!item) {
    return { valid: false, errors: { item: "missing" } };
  }

  const referenceAmount: number = item.referenceAmount;

  if (
    referenceAmount == null ||
    !Number.isFinite(referenceAmount) ||
    referenceAmount <= 0
  ) {
    return {
      valid: false,
      errors: { referenceAmount: "invalid" },
    } satisfies PortionValidationResult;
  }

  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return {
      valid: false,
      errors: { amount: "invalid" },
    } satisfies PortionValidationResult;
  }

  if (!unit || !item.referenceUnit) {
    return {
      valid: false,
      errors: { unit: "missing" },
    } satisfies PortionValidationResult;
  }

  if (unit !== item.referenceUnit) {
    return {
      valid: false,
      errors: { unit: "mismatch" },
    } satisfies PortionValidationResult;
  }

  return { valid: true, value: { scale: amount / referenceAmount } };
}

/** Gets the scale for a portion */
export function getScale(
  item: FoodItem,
  amount: number,
  unit: ReferenceUnit,
): number | null {
  const validation = validatePortion(item, amount, unit);
  return validation.valid ? validation.value.scale : null;
}

/** Scales a macro value */
export function scaleMacroValue(macroValue: number, scale: number): number {
  return (macroValue ?? 0) * scale;
}

/** Scales macros */
export function scaleMacros(
  item: FoodItem,
  amount: number,
  unit: ReferenceUnit,
): ScaleMacrosResult {
  const validation: PortionValidationResult = validatePortion(
    item,
    amount,
    unit,
  );

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
    } satisfies ScaleMacrosResult;
  }

  const source: Macro = item.macros ?? {};

  const macros: Macro = {
    calories: scaleMacroValue(source.calories, validation.value.scale),
    protein: scaleMacroValue(source.protein, validation.value.scale),
    fibres: scaleMacroValue(source.fibres, validation.value.scale),
    fats: scaleMacroValue(source.fats, validation.value.scale),
    carbs: scaleMacroValue(source.carbs, validation.value.scale),
  };

  return {
    valid: true,
    value: { scale: validation.value.scale, macros: macros },
  } satisfies ScaleMacrosResult;
}

/** Scales a consumption entry */
export function scaleConsumptionEntry(
  item: FoodItem,
  entry: ConsumptionEntry,
): ScaleMacrosResult {
  return scaleMacros(item, entry.amount, entry.unit);
}
