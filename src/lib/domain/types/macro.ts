import type { z } from "astro/zod";
import type { macrosSchema } from "@actions/schemas";
import type { PortionInvalidReason } from "@lib/domain/index";

/** Macro input type inferred from macrosSchema */
export type MacroInput = z.input<typeof macrosSchema>;

/** Macro type inferred from macrosSchema */
export type Macro = z.output<typeof macrosSchema>;

/** Macro keys */
export type MacroKeys = keyof Macro;

/** Macro totals */
export type MacroTotals = Record<keyof Macro, number | 0>;

/** Scale macros result */
export type ScaleMacrosResult =
  | { valid: true; scale: number; macros: Macro }
  | { valid: false; reason: PortionInvalidReason };
