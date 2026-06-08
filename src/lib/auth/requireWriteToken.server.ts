import { ActionError } from "astro:actions";
import { isWriteTokenValid } from "@lib/auth/password.server.js";

/** Input field name mutating actions expect on the client. */
export const WRITE_TOKEN_INPUT_KEY = "writeToken" as const;

/** Require a valid write token. */
export function requireWriteToken(writeToken: string): void {
  if (!isWriteTokenValid(writeToken)) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid write token",
    });
  }
}

/** Require a valid write token from the input. */
export function requireWriteTokenFromInput(input: unknown): void {
  const token =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)[WRITE_TOKEN_INPUT_KEY]
      : undefined;

  requireWriteToken(token as string);
}
