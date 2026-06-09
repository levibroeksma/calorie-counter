import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";

import { getRepository } from "@lib/data/getRepository.js";

import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server.js";

import { getTodayLocal } from "@lib/data/date.service.js";
import { findConsumptionDay } from "@lib/domain/consumption.service.js";

import { writeTokenSchema } from "@actions/schemas.js";

import type { RemoveConsumptionPayload } from "@actions/payloads";

export const removeConsumption = defineAction({
  input: writeTokenSchema.extend({
    index: z.number().int().min(0),
  }),
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();
    const consumption = await repo.getConsumption();
    const today = getTodayLocal();
    const day = findConsumptionDay(consumption, today);

    if (!day) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "today_not_found",
      });
    }

    if (input.index < 0 || input.index >= day.consumed.length) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "invalid_index",
      });
    }

    day.consumed.splice(input.index, 1);
    await repo.setConsumption(consumption);

    return {
      today,
      consumption,
      removedIndex: input.index,
    } as RemoveConsumptionPayload;
  },
});
