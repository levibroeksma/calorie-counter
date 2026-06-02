

export const TARGET_FIELDS = [
  'targetCalories',
  'targetProtein',
  'targetFibres',
  'targetFats',
  'targetCarbs',
];

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function validatePreferences(input) {

  const errors = {};

  if (!input || typeof input !== 'object') {
    for (const field of TARGET_FIELDS) {
      errors[field] = 'required';
    }

    return { valid: false, errors };
  }

  const preferences = {
    targetCalories: 0,
    targetProtein: 0,
    targetFibres: 0,
    targetFats: 0,
    targetCarbs: 0,
  };

  for (const field of TARGET_FIELDS) {
    const value = input[field];

    if (!isNonNegativeNumber(value)) {
      errors[field] = 'invalid';
    } else {
      preferences[field] = value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, preferences };
}

export function preferencesToMacroTargets(preferences) {
  return {
    calories: preferences.targetCalories,
    protein: preferences.targetProtein,
    fibres: preferences.targetFibres,
    fats: preferences.targetFats,
    carbs: preferences.targetCarbs,
  };
}
