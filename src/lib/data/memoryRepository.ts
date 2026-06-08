import { shouldUseSeedData } from "@config/environments.js";
import { assertDataRepository } from "@lib/data/repository.contract.js";
import {
  getEmptyConsumption,
  getEmptyItems,
  getEmptyPreferences,
} from "@lib/data/emptyRepositoryDefaults.js";
import { loadSeedData } from "@lib/data/seedLoader.js";
import type {
  Cloneable,
  ConsumptionDay,
  DataRepository,
  FoodItem,
  Preferences,
} from "@lib/domain/types.js";

function clone<T extends Cloneable>(value: T): T {
  return structuredClone(value);
}

export function createMemoryRepository(): DataRepository {
  let items: FoodItem[] | null = null;

  let consumption: ConsumptionDay[] | null = null;

  let preferences: Preferences | null = null;

  let seeding: Promise<void> | null = null;

  async function hydrateMissingFromSeed() {
    if (items !== null && consumption !== null && preferences !== null) {
      return;
    }

    if (!seeding) {
      seeding = (async () => {
        const initial = shouldUseSeedData()
          ? await loadSeedData()
          : {
              items: getEmptyItems(),
              consumption: getEmptyConsumption(),
              preferences: getEmptyPreferences(),
            };

        if (items === null) {
          items = initial.items;
        }

        if (consumption === null) {
          consumption = initial.consumption;
        }

        if (preferences === null) {
          preferences = initial.preferences;
        }
      })().finally(() => {
        seeding = null;
      });
    }

    await seeding;
  }

  function assertNonNull<T>(
    value: T | null,
    label: string,
  ): asserts value is T {
    if (value === null) throw new Error(`${label} not hydrated`);
  }

  const repository = {
    async getItems(): Promise<FoodItem[]> {
      await hydrateMissingFromSeed();
      assertNonNull(items, "Items");
      return clone(items);
    },

    async setItems(nextItems: FoodItem[]): Promise<void> {
      items = clone(nextItems);
    },

    async getConsumption(): Promise<ConsumptionDay[]> {
      await hydrateMissingFromSeed();
      assertNonNull(consumption, "Consumption");
      return clone(consumption);
    },

    async setConsumption(nextConsumption: ConsumptionDay[]): Promise<void> {
      consumption = clone(nextConsumption);
    },

    async getPreferences(): Promise<Preferences> {
      await hydrateMissingFromSeed();
      assertNonNull(preferences, "Preferences");
      return clone(preferences);
    },

    async setPreferences(nextPreferences: Preferences): Promise<void> {
      preferences = clone(nextPreferences);
    },
  } as DataRepository;

  assertDataRepository(repository, "memoryRepository");

  return repository;
}

/** Shared dev-process store (new module load on `astro dev` restart). */
export const memoryRepository = createMemoryRepository();
