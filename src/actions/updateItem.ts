import { defineAction } from "astro:actions";

import { getRepository } from "@lib/data/getRepository";

import { validateFoodItemUpdate } from "@lib/domain/foodItem.service";

import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server";
import { throwValidationErrors } from "@actions/actionHelpers.server";

import { updateItemInputSchema } from "@actions/schemas";

import type { UpdateItemPayload } from "@actions/payloads";

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
    } as UpdateItemPayload;
  },
});
