import type { z } from "astro/zod";

import type { preferencesSchema } from "@actions/schemas";

import type { ValidationErrorRecord } from "@lib/domain/index";

/** Preferences available fields for user configuration */
export type Preferences = z.infer<typeof preferencesSchema>;

/** Preferences validation result */
export type PreferencesValidationResult =
  | { valid: false; errors: ValidationErrorRecord }
  | { valid: true; preferences: Preferences };
