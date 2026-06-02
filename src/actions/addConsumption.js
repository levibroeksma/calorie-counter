import { defineAction, ActionError } from 'astro:actions';
import { requireWriteTokenFromInput } from '../lib/auth/requireWriteToken.server.js';
import { getRepository } from '../lib/data/getRepository.js';
import { findConsumptionDay } from '../lib/domain/consumption.service.js';
import { validatePortion } from '../lib/domain/portion.service.js';
import { assertValidPortion } from './actionHelpers.server.js';
import { ensureTodayInMemory } from '../lib/data/appData.server.js';
import { addConsumptionInputSchema } from './schemas.js';

export const addConsumption = defineAction({
  input: addConsumptionInputSchema,
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();
    const [items, consumption] = await Promise.all([
      repo.getItems(),
      repo.getConsumption(),
    ]);

    const item = items.find((candidate) => candidate.id === input.itemId);

    if (!item) {
      throw new ActionError({
        code: 'NOT_FOUND',
        message: 'item_not_found',
      });
    }

    assertValidPortion(validatePortion(item, input.amount, input.unit));

    const ensured = ensureTodayInMemory(consumption);
    const day = findConsumptionDay(ensured.consumption, ensured.today);

    if (!day) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'today_missing',
      });
    }

    const entry = {
      itemId: input.itemId,
      amount: input.amount,
      unit: input.unit,
    };

    day.consumed.push(entry);
    await repo.setConsumption(ensured.consumption);

    return {
      today: ensured.today,
      consumption: ensured.consumption,
      entry,
    };
  },
});
