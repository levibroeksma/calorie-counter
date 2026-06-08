import { shouldUseSeedData } from "@config/environments.js";
import itemsSeed from "@data/seed/items.json" with { type: "json" };
import consumptionSeed from "@data/seed/consumption.json" with { type: "json" };
import preferencesSeed from "@data/seed/preferences.json" with { type: "json" };
import type { Cloneable, FoodItem, Preferences } from "@lib/domain/types.js";
import type { ConsumptionDay } from "@lib/domain/types.js";

type SeedData = {
  items: FoodItem[];
  consumption: ConsumptionDay[];
  preferences: Preferences;
};

function cloneSeed<T extends Cloneable>(value: T): T {
  return structuredClone(value);
}

function assertSeedEnabled() {
  if (!shouldUseSeedData()) {
    throw new Error("Seed data is only available in development");
  }
}

function isFoodItemArray(value: unknown): value is FoodItem[] {
  return Array.isArray(value);
}

function isConsumptionDayArray(value: unknown): value is ConsumptionDay[] {
  return Array.isArray(value);
}

function isPreferencesObject(value: unknown): value is Preferences {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function loadSeedItems(): Promise<FoodItem[]> {
  assertSeedEnabled();

  if (!isFoodItemArray(itemsSeed)) {
    throw new Error(
      "Invalid seed: src/data/seed/items.json must be a JSON array",
    );
  }

  return cloneSeed(itemsSeed as FoodItem[]);
}

export async function loadSeedConsumption(): Promise<ConsumptionDay[]> {
  assertSeedEnabled();

  if (!isConsumptionDayArray(consumptionSeed)) {
    throw new Error(
      "Invalid seed: src/data/seed/consumption.json must be a JSON array",
    );
  }

  return cloneSeed(consumptionSeed as ConsumptionDay[]);
}

export async function loadSeedPreferences(): Promise<Preferences> {
  assertSeedEnabled();

  if (!isPreferencesObject(preferencesSeed)) {
    throw new Error(
      "Invalid seed: src/data/seed/preferences.json must be a JSON object",
    );
  }

  return cloneSeed(preferencesSeed as Preferences);
}

export async function loadSeedData(): Promise<SeedData> {
  const [items, consumption, preferences] = await Promise.all([
    loadSeedItems(),
    loadSeedConsumption(),
    loadSeedPreferences(),
  ]);

  return { items, consumption, preferences };
}
