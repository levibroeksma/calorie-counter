import { defineAction } from "astro:actions";

import { getRepository } from "@lib/data/getRepository";

import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server";
import { ensureTodayInMemory, loadAppData } from "@lib/data/appData.server";

import { writeTokenSchema } from "@actions/schemas";

import type { EnsureTodayPayload } from "@actions/payloads";

/** Ensures today */
export const ensureToday = defineAction({
  input: writeTokenSchema,
  handler: async (input: {
    writeToken: string;
  }): Promise<EnsureTodayPayload> => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();

    let consumption = await repo.getConsumption();

    const {
      consumption: next,
      today,
      created,
    } = ensureTodayInMemory(consumption);

    if (created) {
      await repo.setConsumption(next);
      consumption = next;
    }

    const data = await loadAppData();

    return {
      ...data,
      today,
      created,
    } satisfies EnsureTodayPayload;
  },
});
