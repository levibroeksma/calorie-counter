import { ActionError, defineAction } from "astro:actions";

import { getRepository } from "@lib/data/getRepository";

import { findConsumptionDay } from "@lib/domain/consumption.service";
import { validateNewFoodItem } from "@lib/domain/foodItem.service";
import { validatePortion } from "@lib/domain/portion.service";

import {
  assertValidPortion,
  throwValidationErrors,
} from "@actions/actionHelpers.server";
import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server";
import { ensureTodayInMemory } from "@lib/data/appData.server";

import { createItemInputSchema } from "@actions/schemas";

import type { CreateItemPayload } from "@actions/payloads";

import type { ReferenceUnit } from "@lib/domain/index";

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
      const { amount, unit } = input;
      if (!amount || !unit) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "required",
        });
      }
      assertValidPortion(validatePortion(item, amount, unit));

      const ensured = ensureTodayInMemory(consumption);
      consumption = ensured.consumption;
      const day = findConsumptionDay(consumption, ensured.today);

      if (day) {
        day.consumed.push({
          itemId: item.id,
          amount: amount as number,
          unit: unit as ReferenceUnit,
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
    } as CreateItemPayload;
  },
});
