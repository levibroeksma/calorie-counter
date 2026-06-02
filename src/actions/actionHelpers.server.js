import { ActionError } from 'astro:actions';

export { loadAppData, ensureTodayInMemory } from '../lib/data/appData.server.js';

/**
 * @param {Record<string, string>} errors
 * @throws {ActionError}
 */
export function throwValidationErrors(errors) {
  if (errors.name === 'duplicate') {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'duplicate_name',
    });
  }

  if (errors.id === 'not_found') {
    throw new ActionError({
      code: 'NOT_FOUND',
      message: 'item_not_found',
    });
  }

  throw new ActionError({
    code: 'BAD_REQUEST',
    message: 'validation_failed',
  });
}

/**
 * @param {{ valid: false, reason: string } | { valid: true }} result
 * @throws {ActionError}
 */
export function assertValidPortion(result) {
  if (result.valid) {
    return;
  }

  if (result.reason === 'unit_mismatch') {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: 'unit_mismatch',
    });
  }

  throw new ActionError({
    code: 'BAD_REQUEST',
    message: 'invalid_portion',
  });
}
