import itemsSeed from '../../../public/items.json' with { type: 'json' };
import consumptionSeed from '../../../public/consumption.json' with { type: 'json' };
import preferencesSeed from '../../../public/preferences.json' with { type: 'json' };

function cloneSeed(value) {
  return structuredClone(value);
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
  if (!isFoodItemArray(itemsSeed)) {
    throw new Error('Invalid seed: public/items.json must be a JSON array');
  }
  return cloneSeed(itemsSeed);
}

export async function loadSeedConsumption() {
  if (!isConsumptionDayArray(consumptionSeed)) {
    throw new Error('Invalid seed: public/consumption.json must be a JSON array');
  }
  return cloneSeed(consumptionSeed);
}

export async function loadSeedPreferences() {
  if (!isPreferencesObject(preferencesSeed)) {
    throw new Error('Invalid seed: public/preferences.json must be a JSON object');
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
