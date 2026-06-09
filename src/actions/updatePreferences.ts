import { defineAction } from "astro:actions";
import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server";
import { getRepository } from "@lib/data/getRepository";

import { validatePreferences } from "@lib/domain/userPreference.service";
import { throwValidationErrors } from "@actions/actionHelpers.server";

import { updatePreferencesInputSchema } from "@actions/schemas";
import type { UpdatePreferencesPayload } from "@actions/payloads";

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
    } as UpdatePreferencesPayload;
  },
});
