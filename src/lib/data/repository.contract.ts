import type { DataRepository } from "@lib/data/index";

/** List of method names that must be implemented by a DataRepository. */
export const REPOSITORY_METHOD_NAMES = [
  "getItems",
  "setItems",
  "getConsumption",
  "setConsumption",
  "getPreferences",
  "setPreferences",
] as const;

type RepositoryMethodName = (typeof REPOSITORY_METHOD_NAMES)[number];

function getMissingRepoMethods(value: unknown): RepositoryMethodName[] {
  if (!value || typeof value !== "object") {
    return [...REPOSITORY_METHOD_NAMES];
  }

  const record = value as Record<RepositoryMethodName, unknown>;
  return REPOSITORY_METHOD_NAMES.filter(
    (name) => typeof record[name] !== "function",
  ) as RepositoryMethodName[];
}

export function isDataRepository(value: unknown): value is DataRepository {
  return getMissingRepoMethods(value).length === 0;
}

export function assertDataRepository(candidate: unknown, label = "repository") {
  if (!isDataRepository(candidate)) {
    const missing = getMissingRepoMethods(candidate);
    if (missing.length > 0) {
      throw new TypeError(
        `${label} must implement DataRepository (${REPOSITORY_METHOD_NAMES.join(", ")}). Missing or invalid: ${missing.join(", ") || "not an object"}`,
      );
    }
  }
}
