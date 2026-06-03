import { getStore } from '@netlify/blobs';
import { shouldUseSeedData } from '../config/environments.js';
import { assertDataRepository } from './repository.contract.js';
import {
  getEmptyConsumption,
  getEmptyItems,
  getEmptyPreferences,
} from './emptyRepositoryDefaults.js';
import { BLOB_STORE_KEYS } from './repository.types.js';
import {
  loadSeedConsumption,
  loadSeedItems,
  loadSeedPreferences,
} from './seedLoader.js';

/** Site-wide Netlify Blobs store for persisted JSON blobs. */
export const BLOB_SITE_STORE_NAME = 'calory-tracker';

function clone(value) {
  return structuredClone(value);
}

async function readJsonKey(store, key) {
  const value = await store.get(key, { type: 'json' });

  if (value === null || value === undefined) {
    return null;
  }

  return value;
}

async function readOrInitialize(store, key, { loadSeed, loadEmpty }) {
  const existing = await readJsonKey(store, key);

  if (existing !== null) {
    return clone(existing);
  }

  const initial = shouldUseSeedData() ? await loadSeed() : loadEmpty();
  await store.setJSON(key, initial);

  return clone(initial);
}

function getDefaultBlobStore() {
  return getStore(BLOB_SITE_STORE_NAME);
}

export function createBlobRepository(options = {}) {
  const store = options.store ?? getDefaultBlobStore();

  const repository = {
    async getItems() {
      return (
        readOrInitialize(store, BLOB_STORE_KEYS.ITEMS, {
          loadSeed: loadSeedItems,
          loadEmpty: getEmptyItems,
        })
      );
    },

    async setItems(items) {
      await store.setJSON(BLOB_STORE_KEYS.ITEMS, clone(items));
    },

    async getConsumption() {
      return (
        readOrInitialize(store, BLOB_STORE_KEYS.CONSUMPTION, {
          loadSeed: loadSeedConsumption,
          loadEmpty: getEmptyConsumption,
        })
      );
    },

    async setConsumption(consumption) {
      await store.setJSON(BLOB_STORE_KEYS.CONSUMPTION, clone(consumption));
    },

    async getPreferences() {
      return (
        readOrInitialize(store, BLOB_STORE_KEYS.PREFERENCES, {
          loadSeed: loadSeedPreferences,
          loadEmpty: getEmptyPreferences,
        })
      );
    },

    async setPreferences(preferences) {
      await store.setJSON(BLOB_STORE_KEYS.PREFERENCES, clone(preferences));
    },
  };

  assertDataRepository(repository, 'blobRepository');

  return repository;
}

export function createInMemoryBlobStoreAdapter() {

  const values = new Map();

  return {
    async get(key, options = {}) {
      if (!values.has(key)) {
        return null;
      }

      const value = values.get(key);

      if (options.type === 'json') {
        return clone(value);
      }

      return value;
    },

    async setJSON(key, value) {
      values.set(key, clone(value));
    },
  };
}

let blobRepositoryInstance = null;

export function getBlobRepository() {
  if (!blobRepositoryInstance) {
    blobRepositoryInstance = createBlobRepository();
  }

  return blobRepositoryInstance;
}
