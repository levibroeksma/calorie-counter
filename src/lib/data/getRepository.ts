import { getEnvironmentConfig, PERSISTENCE } from "@config/environments";

import { createBlobRepository } from "@lib/data/blobRepository";
import { memoryRepository } from "@lib/data/memoryRepository";

import type { Persistence } from "@lib/config/index";
import type { BlobStoreLike, DataRepository } from "@lib/data/index";

let repositoryInstance: DataRepository | null = null;

export function resolveRepository(
  persistence: Persistence,
  options: { blobStore?: BlobStoreLike } = {},
): DataRepository {
  if (persistence === PERSISTENCE.BLOB) {
    return options.blobStore
      ? createBlobRepository({ store: options.blobStore })
      : createBlobRepository();
  }

  return memoryRepository;
}

export function getRepository(): DataRepository {
  if (!repositoryInstance) {
    const { persistence } = getEnvironmentConfig();
    repositoryInstance = resolveRepository(persistence);
  }

  return repositoryInstance;
}

/** Clear cached repository (unit tests). */
export function resetRepositoryForTests(): void {
  repositoryInstance = null;
}
