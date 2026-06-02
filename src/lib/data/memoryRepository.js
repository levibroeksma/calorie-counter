import { assertDataRepository } from './repository.contract.js';
import { loadSeedData } from './seedLoader.js';

function clone(value) {
  return structuredClone(value);
}

export function createMemoryRepository() {

  let items = null;

  let consumption = null;

  let preferences = null;

  let seeding = null;

  async function hydrateMissingFromSeed() {
    if (items !== null && consumption !== null && preferences !== null) {
      return;
    }

    if (!seeding) {
      seeding = (async () => {
        const seed = await loadSeedData();

        if (items === null) {
          items = seed.items;
        }

        if (consumption === null) {
          consumption = seed.consumption;
        }

        if (preferences === null) {
          preferences = seed.preferences;
        }
      })().finally(() => {
        seeding = null;
      });
    }

    await seeding;
  }

  const repository = {
    async getItems() {
      await hydrateMissingFromSeed();
      return clone(items);
    },

    async setItems(nextItems) {
      items = clone(nextItems);
    },

    async getConsumption() {
      await hydrateMissingFromSeed();
      return clone(consumption);
    },

    async setConsumption(nextConsumption) {
      consumption = clone(nextConsumption);
    },

    async getPreferences() {
      await hydrateMissingFromSeed();
      return clone(preferences);
    },

    async setPreferences(nextPreferences) {
      preferences = clone(nextPreferences);
    },
  };

  assertDataRepository(repository, 'memoryRepository');

  return repository;
}

/** Shared dev-process store (new module load on `astro dev` restart). */
export const memoryRepository = createMemoryRepository();
