

const REFERENCE_UNITS = ['g', 'ml'];
const OPTIONAL_MACRO_FIELDS = ['fibres', 'fats', 'carbs'];

export function normalizeItemName(name) {
  return name?.trim() ?? '';
}

export function getNameKey(name) {
  return normalizeItemName(name).toLowerCase();
}

export function getNextItemId(items) {
  let maxId = 0;

  for (const item of items) {
    if (Number.isInteger(item?.id) && item.id > maxId) {
      maxId = item.id;
    }
  }

  return maxId + 1;
}

export function isDuplicateName(items, name, excludeId = null) {
  const key = getNameKey(name);

  if (!key) {
    return false;
  }

  return items.some(
    (item) => item.id !== excludeId && getNameKey(item.name) === key,
  );
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isReferenceUnit(value) {
  return value === 'g' || value === 'ml';
}

export function validateFoodItem(input, context) {

  const errors = {};
  const { items, excludeId = null } = context;

  const name = normalizeItemName(input.name);
  if (!name) {
    errors.name = 'required';
  } else if (isDuplicateName(items, name, excludeId)) {
    errors.name = 'duplicate';
  }

  const referenceAmount = input.referenceAmount;
  if (
    referenceAmount == null ||
    !Number.isInteger(referenceAmount) ||
    referenceAmount < 1
  ) {
    errors.referenceAmount = 'invalid';
  }

  if (!isReferenceUnit(input.referenceUnit)) {
    errors.referenceUnit = 'invalid';
  }

  const macros = input.macros ?? {};

  if (!isNonNegativeNumber(macros.calories)) {
    errors['macros.calories'] = 'required';
  }

  if (!isNonNegativeNumber(macros.protein)) {
    errors['macros.protein'] = 'required';
  }

  for (const field of OPTIONAL_MACRO_FIELDS) {
    const value = macros[field];

    if (value != null && !isNonNegativeNumber(value)) {
      errors[`macros.${field}`] = 'invalid';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const value = {
    id: excludeId ?? input.id,
    name,
    referenceAmount,
    referenceUnit: input.referenceUnit,
    macros: {
      calories: macros.calories,
      protein: macros.protein,
      ...(macros.fibres != null ? { fibres: macros.fibres } : {}),
      ...(macros.fats != null ? { fats: macros.fats } : {}),
      ...(macros.carbs != null ? { carbs: macros.carbs } : {}),
    },
  };

  return { valid: true, value };
}

export function validateNewFoodItem(input, items) {
  const result = validateFoodItem(input, { items });

  if (!result.valid) {
    return result;
  }

  return {
    valid: true,
    item: {
      ...result.value,
      id: getNextItemId(items),
    },
  };
}

export function validateFoodItemUpdate(input, items, id) {
  const existing = items.find((item) => item.id === id);

  if (!existing) {
    return { valid: false, errors: { id: 'not_found' } };
  }

  const result = validateFoodItem({ ...input, id }, { items, excludeId: id });

  if (!result.valid) {
    return result;
  }

  return {
    valid: true,
    item: {
      ...result.value,
      id,
    },
  };
}

export { REFERENCE_UNITS };
