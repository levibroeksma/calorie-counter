import { defineAction } from 'astro:actions';
import { requireWriteTokenFromInput } from '../lib/auth/requireWriteToken.server.js';
import { getRepository } from '../lib/data/getRepository.js';
import { findConsumptionDay } from '../lib/domain/consumption.service.js';
import { validateNewFoodItem } from '../lib/domain/foodItem.service.js';
import { validatePortion } from '../lib/domain/portion.service.js';
import { assertValidPortion, throwValidationErrors } from './actionHelpers.server.js';
import { ensureTodayInMemory } from '../lib/data/appData.server.js';
import { createItemInputSchema } from './schemas.js';

export const createItem = defineAction({
  input: createItemInputSchema,
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();
    const items = await repo.getItems();
    const validation = validateNewFoodItem(
      {
        name: input.name,
        referenceAmount: input.referenceAmount,
        referenceUnit: input.referenceUnit,
        macros: input.macros,
      },
      items,
    );

    if (!validation.valid) {
      throwValidationErrors(validation.errors);
    }

    const item = validation.item;
    const nextItems = [...items, item];
    await repo.setItems(nextItems);

    let consumption = await repo.getConsumption();
    let logged = false;

    if (input.logToToday) {
      assertValidPortion(
        validatePortion(item, input.amount, input.unit),
      );

      const ensured = ensureTodayInMemory(consumption);
      consumption = ensured.consumption;
      const day = findConsumptionDay(consumption, ensured.today);

      if (day) {
        day.consumed.push({
          itemId: item.id,
          amount: /** @type {number} */ (input.amount),
          unit: /** @type {string} */ (input.unit),
        });
      }

      await repo.setConsumption(consumption);
      logged = true;
    }

    return {
      item,
      items: nextItems,
      consumption,
      logged,
    };
  },
});
