import { defineAction, ActionError } from "astro:actions";

import { getRepository } from "@lib/data/getRepository";

import { findConsumptionDay } from "@lib/domain/consumption.service";
import { validatePortion } from "@lib/domain/portion.service";

import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server";
import { assertValidPortion } from "@actions/actionHelpers.server";
import { ensureTodayInMemory } from "@lib/data/appData.server";

import { addConsumptionInputSchema } from "@actions/schemas";

import type {
  ConsumptionEntry,
  ConsumptionDay,
  FoodItem,
  LocalDate,
} from "@lib/domain/index";

import type { AddConsumptionPayload } from "@actions/payloads";

export const addConsumption = defineAction({
  input: addConsumptionInputSchema,
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();
    const [items, consumption] = await Promise.all([
      repo.getItems(),
      repo.getConsumption(),
    ]);

    const item: FoodItem | undefined = items.find(
      (candidate: FoodItem) => candidate.id === input.itemId,
    );

    if (!item) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "item_not_found",
      });
    }

    assertValidPortion(validatePortion(item, input.amount, input.unit));

    const ensured = ensureTodayInMemory(consumption);
    const day: ConsumptionDay | undefined = findConsumptionDay(
      ensured.consumption as ConsumptionDay[],
      ensured.today as LocalDate,
    );

    if (!day) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "today_missing",
      });
    }

    const entry: ConsumptionEntry = {
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
    } satisfies AddConsumptionPayload;
  },
});
