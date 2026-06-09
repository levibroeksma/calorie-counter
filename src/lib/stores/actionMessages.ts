import { isActionError } from "astro:actions";
import nl from "@lib/copy/nl";

/** Creates a message for an action error */
export function messageForActionError(error: unknown): string {
  if (!isActionError(error)) return nl.toasts.saveFailed;
  if (error.code === "UNAUTHORIZED") return nl.toasts.unauthorized;

  const message = error.message ?? "";

  if (message === "duplicate_name") return nl.errors.duplicateName;
  if (message === "unit_mismatch") return nl.errors.unitMismatch;
  if (message === "invalid_portion") return nl.errors.invalidPortion;
  if (message === "invalid_password") return nl.auth.loginFailed;

  return nl.toasts.saveFailed;
}
