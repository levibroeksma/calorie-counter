export type ValidationErrorRecord = Record<string, string>;

export type ValidationResult<T> =
  | { valid: false; errors: ValidationErrorRecord }
  | { valid: true; value: T };
