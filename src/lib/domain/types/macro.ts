import type { z } from "astro/zod";
import type { macrosSchema } from "@actions/schemas";
import type { ValidationResult } from "@lib/domain/index";

/** Macro input type inferred from macrosSchema */
export type MacroInput = z.input<typeof macrosSchema>;

/** Macro type inferred from macrosSchema */
export type Macro = z.output<typeof macrosSchema>;

/** Macro keys */
export type MacroKeys = keyof Macro;

/** Macro totals */
export type MacroTotals = Record<keyof Macro, number>;

/** Scale macros result */
export type ScaleMacrosResult = ValidationResult<{
  scale: number;
  macros: Macro;
}>;
