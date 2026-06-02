import { shouldUseSeedData } from '../config/environments.js';
import itemsSeed from '../../data/seed/items.json' with { type: 'json' };
import consumptionSeed from '../../data/seed/consumption.json' with { type: 'json' };
import preferencesSeed from '../../data/seed/preferences.json' with { type: 'json' };

function cloneSeed(value) {
  return structuredClone(value);
}

function assertSeedEnabled() {
  if (!shouldUseSeedData()) {
    throw new Error('Seed data is only available in development');
  }
}

function isFoodItemArray(value) {
  return Array.isArray(value);
}

function isConsumptionDayArray(value) {
  return Array.isArray(value);
}

function isPreferencesObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export async function loadSeedItems() {
  assertSeedEnabled();

  if (!isFoodItemArray(itemsSeed)) {
    throw new Error('Invalid seed: src/data/seed/items.json must be a JSON array');
  }

  return cloneSeed(itemsSeed);
}

export async function loadSeedConsumption() {
  assertSeedEnabled();

  if (!isConsumptionDayArray(consumptionSeed)) {
    throw new Error('Invalid seed: src/data/seed/consumption.json must be a JSON array');
  }

  return cloneSeed(consumptionSeed);
}

export async function loadSeedPreferences() {
  assertSeedEnabled();

  if (!isPreferencesObject(preferencesSeed)) {
    throw new Error('Invalid seed: src/data/seed/preferences.json must be a JSON object');
  }

  return cloneSeed(preferencesSeed);
}

export async function loadSeedData() {
  const [items, consumption, preferences] = await Promise.all([
    loadSeedItems(),
    loadSeedConsumption(),
    loadSeedPreferences(),
  ]);

  return { items, consumption, preferences };
}
