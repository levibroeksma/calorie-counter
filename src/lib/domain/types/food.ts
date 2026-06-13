import type { z } from "astro/zod";

import type {
  foodItemFieldsSchema,
  referenceUnitSchema,
} from "@actions/schemas";

import type { ValidationResult } from "@lib/domain/index";

/** Food item fields */
export type FoodItemFields = z.infer<typeof foodItemFieldsSchema>;

/** Food item */
export type FoodItem = FoodItemFields & {
  id: number;
};

/** Food item input */
export type FoodItemInput = z.infer<typeof foodItemFieldsSchema>;

/** Food item validation result */
export type FoodItemValidationResult = ValidationResult<FoodItem>;

/** Reference unit */
export type ReferenceUnit = z.infer<typeof referenceUnitSchema>;

/** Update item fields */
export type UpdateItemFields = FoodItemInput & { id: number };
