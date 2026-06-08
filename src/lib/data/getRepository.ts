import { getEnvironmentConfig, PERSISTENCE } from "@config/environments.js";
import { createBlobRepository } from "@lib/data/blobRepository.js";
import { memoryRepository } from "@lib/data/memoryRepository.js";
import type {
  BlobStoreLike,
  DataRepository,
  Persistence,
} from "@lib/domain/types.js";

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
