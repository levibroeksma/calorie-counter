import { defineAction } from 'astro:actions';
import { requireWriteTokenFromInput } from '../lib/auth/requireWriteToken.server.js';
import { getRepository } from '../lib/data/getRepository.js';
import { ensureTodayInMemory, loadAppData } from '../lib/data/appData.server.js';
import { writeTokenSchema } from './schemas.js';

export const ensureToday = defineAction({
  input: writeTokenSchema,
  handler: async (input) => {
    requireWriteTokenFromInput(input);

    const repo = getRepository();
    let consumption = await repo.getConsumption();
    const { consumption: next, today, created } =
      ensureTodayInMemory(consumption);

    if (created) {
      await repo.setConsumption(next);
      consumption = next;
    }

    const data = await loadAppData();

    return {
      today,
      created,
      consumption: data.consumption,
      items: data.items,
      preferences: data.preferences,
    };
  },
});
