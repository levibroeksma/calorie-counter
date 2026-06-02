import {
  getEnvironmentConfig,
  PERSISTENCE,
} from '../config/environments.js';
import { createBlobRepository } from './blobRepository.js';
import { memoryRepository } from './memoryRepository.js';

let repositoryInstance = null;

export function resolveRepository(persistence, options = {}) {
  if (persistence === PERSISTENCE.BLOB) {
    return options.blobStore
      ? createBlobRepository({ store: options.blobStore })
      : createBlobRepository();
  }

  return memoryRepository;
}

export function getRepository() {
  if (!repositoryInstance) {
    const { persistence } = getEnvironmentConfig();
    repositoryInstance = resolveRepository(persistence);
  }

  return repositoryInstance;
}

/** Clear cached repository (unit tests). */
export function resetRepositoryForTests() {
  repositoryInstance = null;
}
