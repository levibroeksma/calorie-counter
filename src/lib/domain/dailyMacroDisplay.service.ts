import type { MacroKeys, MacroTotals, Preferences } from "@lib/domain/types.js";
import { MACRO_FIELDS, roundForDisplay } from "@lib/domain/portion.service.js";
import { preferencesToMacroTargets } from "@lib/domain/userPreference.service.js";

export type MacroBarRow = {
  key: MacroKeys;
  achieved: number;
  target: number;
  targetLabel: string;
  fillClass: string;
};

export function macroBarFillClass(
  field: MacroKeys,
  achieved: number,
  target: number,
): string {
  if (field === "calories") {
    if (target > 0 && achieved > target) {
      return "bg-danger";
    }

    if (target <= 0 || achieved <= target) {
      return "bg-accent";
    }

    return "bg-slate-500";
  }

  if (target > 0 && achieved >= target) {
    return "bg-accent";
  }

  return "bg-slate-500";
}

export function buildMacroBarRows(
  achieved: MacroTotals,
  preferences: Preferences,
): MacroBarRow[] {
  const targets = preferencesToMacroTargets(preferences);

  return MACRO_FIELDS.map((field) => {
    const value = roundForDisplay(achieved[field] ?? 0);
    const target = roundForDisplay(targets[field] ?? 0);
    const unitSuffix = field === "calories" ? " kcal" : " g";

    return {
      key: field,
      achieved: value,
      target,
      targetLabel: `${target}${unitSuffix}`,
      fillClass: macroBarFillClass(field, value, target),
    };
  });
}
