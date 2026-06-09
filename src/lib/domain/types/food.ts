import type { z } from "astro/zod";

import type {
  foodItemFieldsSchema,
  referenceUnitSchema,
} from "@actions/schemas";

import type { ValidationErrorRecord } from "@lib/domain/index";

/** Food item fields */
export type FoodItemFields = z.infer<typeof foodItemFieldsSchema>;

/** Food item */
export type FoodItem = FoodItemFields & {
  id: number;
};
/** Food item input */
export type FoodItemInput = z.input<typeof foodItemFieldsSchema>;

/** Food item validation result */
export type FoodItemValidationResult =
  | { valid: false; errors: ValidationErrorRecord }
  | { valid: true; item: FoodItem };

/** Reference unit */
export type ReferenceUnit = z.infer<typeof referenceUnitSchema>;

/** Update item fields */
export type UpdateItemFields = FoodItemInput & { id: number };
