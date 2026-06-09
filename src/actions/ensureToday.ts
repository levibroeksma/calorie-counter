import { defineAction } from "astro:actions";

import { getRepository } from "@lib/data/getRepository.js";

import { requireWriteTokenFromInput } from "@lib/auth/requireWriteToken.server.js";
import { ensureTodayInMemory, loadAppData } from "@lib/data/appData.server.js";

import { writeTokenSchema } from "@actions/schemas.js";

import type { EnsureTodayPayload } from "@actions/payloads";

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
    } as EnsureTodayPayload;
  },
});
