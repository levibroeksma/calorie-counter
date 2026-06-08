import { defineAction, ActionError } from "astro:actions";
import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server.js";
import { getRepository } from "@lib/data/getRepository.js";
import { findConsumptionDay } from "@lib/domain/consumption.service.js";
import { validatePortion } from "@lib/domain/portion.service.js";
import { assertValidPortion } from "@actions/actionHelpers.server.js";
import { ensureTodayInMemory } from "@lib/data/appData.server.js";
import { addConsumptionInputSchema } from "@actions/schemas.js";
import type {
  ConsumptionEntry,
  ConsumptionDay,
  FoodItem,
  LocalDate,
  AddConsumptionPayload,
} from "@lib/domain/types.js";

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
    } as AddConsumptionPayload;
  },
});
