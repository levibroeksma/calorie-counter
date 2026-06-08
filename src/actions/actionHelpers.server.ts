import { ActionError } from "astro:actions";
import type {
  PortionValidationResult,
  ValidationErrorRecord,
} from "@lib/domain/types.js";

export { loadAppData, ensureTodayInMemory } from "@lib/data/appData.server.js";

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
): asserts result is { valid: true; scale: number } {
  if (result.valid) {
    return;
  }

  if (result.reason === "unit_mismatch") {
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
