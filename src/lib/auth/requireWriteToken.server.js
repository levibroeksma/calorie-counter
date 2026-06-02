import { ActionError } from 'astro:actions';
import { isWriteTokenValid } from './password.server.js';

/** Input field name mutating actions expect on the client. */
export const WRITE_TOKEN_INPUT_KEY = 'writeToken';

export function requireWriteToken(writeToken) {
  if (!isWriteTokenValid(writeToken)) {
    throw new ActionError({
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid write token',
    });
  }
}

export function requireWriteTokenFromInput(input) {
  const token =
    input && typeof input === 'object'
      ? input[WRITE_TOKEN_INPUT_KEY]
      : undefined;

  requireWriteToken(token);
}
