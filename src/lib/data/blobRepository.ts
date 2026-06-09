import { getStore } from "@netlify/blobs";

import { shouldUseSeedData } from "@config/environments.js";
import { assertDataRepository } from "@lib/data/repository.contract.js";

import {
  getEmptyConsumption,
  getEmptyItems,
  getEmptyPreferences,
} from "@lib/data/emptyRepositoryDefaults.js";

import {
  loadSeedConsumption,
  loadSeedItems,
  loadSeedPreferences,
} from "@lib/data/seedLoader.js";

import { BLOB_STORE_KEYS } from "@lib/data/index.js";

import type { ConsumptionDay, FoodItem, Preferences } from "@lib/domain/index";

import type {
  BlobStoreKey,
  BlobStoreLike,
  Cloneable,
  DataRepository,
  BlobWriteResult,
} from "@lib/data/index";

/** Site-wide Netlify Blobs store for persisted JSON blobs. */
export const BLOB_SITE_STORE_NAME = "calory-tracker" as const;

/** Clone a value of type `Cloneable`. */
function clone<T extends Cloneable>(value: T): T {
  return structuredClone(value);
}

async function readJsonKey(
  store: BlobStoreLike,
  key: BlobStoreKey,
): Promise<Cloneable | null> {
  const value = await store.get(key, { type: "json" });

  if (value === null || value === undefined) {
    return null;
  }

  return value as Cloneable;
}

async function readOrInitialize<T extends Cloneable>(
  store: BlobStoreLike,
  key: BlobStoreKey,
  { loadSeed, loadEmpty }: { loadSeed: () => Promise<T>; loadEmpty: () => T },
): Promise<T> {
  const existing = await readJsonKey(store, key);

  if (existing !== null) {
    return clone(existing as T) as T;
  }

  const initial = shouldUseSeedData() ? await loadSeed() : loadEmpty();
  await store.setJSON(key, initial);

  return clone(initial) as T;
}

function getDefaultBlobStore(): BlobStoreLike {
  return getStore(BLOB_SITE_STORE_NAME);
}

export function createBlobRepository(
  options: { store?: BlobStoreLike } = {},
): DataRepository {
  const store = options.store ?? getDefaultBlobStore();

  const repository = {
    async getItems(): Promise<FoodItem[]> {
      return readOrInitialize(store as BlobStoreLike, BLOB_STORE_KEYS.ITEMS, {
        loadSeed: loadSeedItems,
        loadEmpty: getEmptyItems,
      });
    },

    async setItems(items: FoodItem[]): Promise<void> {
      await store.setJSON(BLOB_STORE_KEYS.ITEMS, clone(items));
    },

    async getConsumption(): Promise<ConsumptionDay[]> {
      return readOrInitialize(
        store as BlobStoreLike,
        BLOB_STORE_KEYS.CONSUMPTION,
        {
          loadSeed: loadSeedConsumption,
          loadEmpty: getEmptyConsumption,
        },
      );
    },

    async setConsumption(consumption: ConsumptionDay[]): Promise<void> {
      await store.setJSON(BLOB_STORE_KEYS.CONSUMPTION, clone(consumption));
    },

    async getPreferences(): Promise<Preferences> {
      return readOrInitialize(
        store as BlobStoreLike,
        BLOB_STORE_KEYS.PREFERENCES,
        {
          loadSeed: loadSeedPreferences,
          loadEmpty: getEmptyPreferences,
        },
      );
    },

    async setPreferences(preferences: Preferences): Promise<void> {
      await store.setJSON(BLOB_STORE_KEYS.PREFERENCES, clone(preferences));
    },
  } as DataRepository;

  assertDataRepository(repository, "blobRepository");

  return repository;
}

export function createInMemoryBlobStoreAdapter(): BlobStoreLike {
  const values = new Map<string, unknown>();

  return {
    async get(key, options) {
      if (!values.has(key)) return null;

      const value = values.get(key);

      if ("type" in options && options.type === "json")
        return clone(value as Cloneable);

      return value;
    },

    async setJSON(key: string, value: unknown): Promise<BlobWriteResult> {
      values.set(key, clone(value as Cloneable));
      return { modified: true };
    },
  } as BlobStoreLike;
}

let blobRepositoryInstance: DataRepository | null = null;

export function getBlobRepository(): DataRepository {
  if (!blobRepositoryInstance) {
    blobRepositoryInstance = createBlobRepository();
  }

  return blobRepositoryInstance as DataRepository;
}
