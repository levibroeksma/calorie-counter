import { defineAction } from 'astro:actions';
import { requireWriteTokenFromInput } from '../lib/auth/requireWriteToken.server.js';
import { getRepository } from '../lib/data/getRepository.js';
import { validateFoodItemUpdate } from '../lib/domain/foodItem.service.js';
import { throwValidationErrors } from './actionHelpers.server.js';
import { updateItemInputSchema } from './schemas.js';

export const updateItem = defineAction({
  input: updateItemInputSchema,
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();
    const items = await repo.getItems();
    const validation = validateFoodItemUpdate(
      {
        name: input.name,
        referenceAmount: input.referenceAmount,
        referenceUnit: input.referenceUnit,
        macros: input.macros,
      },
      items,
      input.id,
    );

    if (!validation.valid) {
      throwValidationErrors(validation.errors);
    }

    const nextItems = items.map((item) =>
      item.id === input.id ? validation.item : item,
    );
    await repo.setItems(nextItems);

    return {
      item: validation.item,
      items: nextItems,
    };
  },
});
