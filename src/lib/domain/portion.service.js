

export const MACRO_FIELDS = [
  'calories',
  'protein',
  'fibres',
  'fats',
  'carbs',
];

export function roundForDisplay(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

export function roundMacrosForDisplay(macros) {

  const rounded = {
    calories: 0,
    protein: 0,
    fibres: 0,
    fats: 0,
    carbs: 0,
  };

  for (const field of MACRO_FIELDS) {
    rounded[field] = roundForDisplay(macros[field] ?? 0);
  }

  return rounded;
}

export function validatePortion(item, amount, unit) {
  if (!item || typeof item !== 'object') {
    return { valid: false, reason: 'missing_item' };
  }

  const referenceAmount = item.referenceAmount;

  if (
    referenceAmount == null ||
    !Number.isFinite(referenceAmount) ||
    referenceAmount <= 0
  ) {
    return { valid: false, reason: 'invalid_reference_amount' };
  }

  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return { valid: false, reason: 'invalid_amount' };
  }

  if (!unit || !item.referenceUnit) {
    return { valid: false, reason: 'missing_unit' };
  }

  if (unit !== item.referenceUnit) {
    return { valid: false, reason: 'unit_mismatch' };
  }

  return { valid: true, scale: amount / referenceAmount };
}

export function getScale(item, amount, unit) {
  const validation = validatePortion(item, amount, unit);
  return validation.valid ? validation.scale : null;
}

export function scaleMacroValue(macroValue, scale) {
  return (macroValue ?? 0) * scale;
}

export function scaleMacros(item, amount, unit) {
  const validation = validatePortion(item, amount, unit);

  if (!validation.valid) {
    return { valid: false, reason: validation.reason };
  }

  const source = item.macros ?? {};

  const macros = {
    calories: scaleMacroValue(source.calories, validation.scale),
    protein: scaleMacroValue(source.protein, validation.scale),
    fibres: scaleMacroValue(source.fibres, validation.scale),
    fats: scaleMacroValue(source.fats, validation.scale),
    carbs: scaleMacroValue(source.carbs, validation.scale),
  };

  return { valid: true, macros };
}

export function scaleConsumptionEntry(item, entry) {
  return scaleMacros(item, entry?.amount, entry?.unit);
}
