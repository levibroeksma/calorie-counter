import type {
  FoodItem,
  FoodItemInput,
  FoodItemValidationResult,
  ReferenceUnit,
  ValidationErrorRecord,
} from "@lib/domain/types";

const REFERENCE_UNITS = ["g", "ml"] as const;
const OPTIONAL_MACRO_FIELDS = ["fibres", "fats", "carbs"] as const;

export function normalizeItemName(name: string | undefined): string {
  return name?.trim() ?? "";
}

export function getNameKey(name: string | undefined): string {
  return normalizeItemName(name).toLowerCase();
}

export function getNextItemId(items: FoodItem[]): number {
  let maxId = 0;

  for (const item of items) {
    if (Number.isInteger(item?.id) && item.id > maxId) {
      maxId = item.id;
    }
  }

  return maxId + 1;
}

export function isDuplicateName(
  items: FoodItem[],
  name: string | undefined,
  excludeId: number | null = null,
): boolean {
  const key = getNameKey(name);

  if (!key) {
    return false;
  }

  return items.some(
    (item: FoodItem) =>
      item.id !== excludeId && getNameKey(item.name ?? undefined) === key,
  );
}

function isNonNegativeNumber(value: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isReferenceUnit(value: ReferenceUnit): boolean {
  return REFERENCE_UNITS.includes(value);
}

export function validateFoodItem(
  input: FoodItemInput,
  context: { items: FoodItem[]; excludeId: number | null },
): FoodItemValidationResult {
  const errors: ValidationErrorRecord = {};
  const { items, excludeId = null } = context;

  const name = normalizeItemName(input.name);
  if (!name) {
    errors.name = "required";
  } else if (isDuplicateName(items, name, excludeId)) {
    errors.name = "duplicate";
  }

  const referenceAmount: unknown = input.referenceAmount;
  if (
    referenceAmount == null ||
    !Number.isInteger(referenceAmount) ||
    (referenceAmount as number) < 1
  ) {
    errors.referenceAmount = "invalid";
  }

  if (!isReferenceUnit(input.referenceUnit)) {
    errors.referenceUnit = "invalid";
  }

  const macros = input.macros ?? {};

  if (!isNonNegativeNumber(macros.calories as number)) {
    errors["macros.calories"] = "required";
  }

  if (!isNonNegativeNumber(macros.protein as number)) {
    errors["macros.protein"] = "required";
  }

  for (const field of OPTIONAL_MACRO_FIELDS) {
    const value = macros[field as keyof typeof macros];

    if (value != null && !isNonNegativeNumber(value as number)) {
      errors[`macros.${field}`] = "invalid";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors } as FoodItemValidationResult;
  }

  const value = {
    id: excludeId ?? (input as FoodItemInput & { id: number }).id,
    name,
    referenceAmount: referenceAmount as number,
    referenceUnit: input.referenceUnit,
    macros: {
      calories: macros.calories as number,
      protein: macros.protein as number,
      ...(macros.fibres != null ? { fibres: macros.fibres as number } : {}),
      ...(macros.fats != null ? { fats: macros.fats as number } : {}),
      ...(macros.carbs != null ? { carbs: macros.carbs as number } : {}),
    },
  };

  return {
    valid: true,
    item: value as FoodItem,
  } as FoodItemValidationResult;
}

export function validateNewFoodItem(
  input: FoodItemInput,
  items: FoodItem[],
): FoodItemValidationResult {
  const result = validateFoodItem(input, { items, excludeId: null });

  if (!result.valid) {
    return result as FoodItemValidationResult;
  }

  return {
    valid: true,
    item: {
      ...result.item,
      id: getNextItemId(items),
    } as FoodItem,
  } as FoodItemValidationResult;
}

export function validateFoodItemUpdate(
  input: FoodItemInput,
  items: FoodItem[],
  id: number,
): FoodItemValidationResult {
  const existing = items.find((item: FoodItem) => item.id === id);

  if (!existing) {
    return {
      valid: false,
      errors: { id: "not_found" },
    } as FoodItemValidationResult;
  }

  const result = validateFoodItem(input, { items, excludeId: id });

  if (!result.valid) {
    return result as FoodItemValidationResult;
  }

  return {
    valid: true,
    item: {
      ...result.item,
      id,
    } as FoodItem,
  } as FoodItemValidationResult;
}
