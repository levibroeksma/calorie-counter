import { getTodayLocal } from './date.service.js';
import { getRepository } from './getRepository.js';
import { findConsumptionDay } from '../domain/consumption.service.js';

export async function loadAppData() {
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

export function ensureTodayInMemory(consumption) {
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
