import { getTodayLocal } from "@lib/data/date.service";
import { getRepository } from "@lib/data/getRepository";

import { findConsumptionDay } from "@lib/domain/consumption.service";

import type { ConsumptionDay } from "@lib/domain/index";
import type { LocalDate } from "@lib/domain/types/index";
import type { LoadDataPayload } from "@actions/payloads";

export async function loadAppData(): Promise<LoadDataPayload> {
  const repo = getRepository();
  const [items, consumption, preferences] = await Promise.all([
    repo.getItems(),
    repo.getConsumption(),
    repo.getPreferences(),
  ]);

  return {
    items,
    consumption,
    preferences,
    today: getTodayLocal(),
  };
}

export function ensureTodayInMemory(consumption: ConsumptionDay[]): {
  consumption: ConsumptionDay[];
  today: LocalDate;
  created: boolean;
} {
  const today = getTodayLocal();

  if (findConsumptionDay(consumption, today)) {
    return { consumption, today, created: false };
  }

  return {
    consumption: [...consumption, { date: today, consumed: [] }],
    today,
    created: true,
  };
}
