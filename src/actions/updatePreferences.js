import { defineAction } from 'astro:actions';
import { requireWriteTokenFromInput } from '../lib/auth/requireWriteToken.server.js';
import { getRepository } from '../lib/data/getRepository.js';
import { validatePreferences } from '../lib/domain/userPreference.service.js';
import { throwValidationErrors } from './actionHelpers.server.js';
import { updatePreferencesInputSchema } from './schemas.js';

export const updatePreferences = defineAction({
  input: updatePreferencesInputSchema,
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const validation = validatePreferences({
      targetCalories: input.targetCalories,
      targetProtein: input.targetProtein,
      targetFibres: input.targetFibres,
      targetFats: input.targetFats,
      targetCarbs: input.targetCarbs,
    });

    if (!validation.valid) {
      throwValidationErrors(validation.errors);
    }

    const repo = getRepository();
    await repo.setPreferences(validation.preferences);

    return {
      preferences: validation.preferences,
    };
  },
});
