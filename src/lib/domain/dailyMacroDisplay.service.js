import { MACRO_FIELDS, roundForDisplay } from './portion.service.js';
import { preferencesToMacroTargets } from './userPreference.service.js';

export function macroBarFillClass(field, achieved, target) {
  if (field === 'calories') {
    if (target > 0 && achieved > target) {
      return 'bg-danger';
    }

    if (target <= 0 || achieved <= target) {
      return 'bg-accent';
    }

    return 'bg-slate-500';
  }

  if (target > 0 && achieved >= target) {
    return 'bg-accent';
  }

  return 'bg-slate-500';
}

export function buildMacroBarRows(achieved, preferences) {
  const targets = preferencesToMacroTargets(preferences);

  return MACRO_FIELDS.map((field) => {
    const value = roundForDisplay(achieved[field] ?? 0);
    const target = roundForDisplay(targets[field] ?? 0);
    const unitSuffix = field === 'calories' ? ' kcal' : ' g';

    return {
      key: field,
      achieved: value,
      target,
      targetLabel: `${target}${unitSuffix}`,
      fillClass: macroBarFillClass(field, value, target),
    };
  });
}
