import { getTodayLocal } from "@lib/data/date.service.js";
import { getRepository } from "@lib/data/getRepository.js";
import { findConsumptionDay } from "@lib/domain/consumption.service.js";
import type {
  ConsumptionDay,
  LoadDataPayload,
  LocalDate,
} from "@lib/domain/types.js";

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
