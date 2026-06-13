import type { ValidationResult } from "./validation";

/** Portion invalid reason */
export type PortionInvalidReason =
  | "missing_item"
  | "invalid_reference_amount"
  | "invalid_amount"
  | "missing_unit"
  | "unit_mismatch";

/** Portion validation result */
export type PortionValidationResult = ValidationResult<{ scale: number }>;
