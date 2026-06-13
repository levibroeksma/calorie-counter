import { ActionError } from "astro:actions";

import type {
  ValidationErrorRecord,
  PortionValidationResult,
} from "@lib/domain/index";

export { loadAppData, ensureTodayInMemory } from "@lib/data/appData.server";

/**  Throw an ActionError when validation fails.*/
export function throwValidationErrors(errors: ValidationErrorRecord): never {
  if (errors.name === "duplicate") {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: "duplicate_name",
    });
  }

  if (errors.id === "not_found") {
    throw new ActionError({
      code: "NOT_FOUND",
      message: "item_not_found",
    });
  }

  throw new ActionError({
    code: "BAD_REQUEST",
    message: "validation_failed",
  });
}

/** Assert a valid portion. */
export function assertValidPortion(
  result: PortionValidationResult,
): asserts result is { valid: true; value: { scale: number } } {
  if (result.valid) {
    return;
  }

  if (result.errors.unit === "mismatch") {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: "unit_mismatch",
    });
  }

  throw new ActionError({
    code: "BAD_REQUEST",
    message: "invalid_portion",
  });
}
