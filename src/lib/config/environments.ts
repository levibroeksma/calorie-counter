import type { EnvironmentConfig, Persistence } from "@lib/config/index";

/** Persistence backends used by repositories for automated development and production seperation. */
export const PERSISTENCE = {
  MEMORY: "memory",
  BLOB: "blob",
} as const;

/** Get the environment configuration dynamically from the import.meta.env. */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isProduction: boolean = import.meta.env.PROD;

  return {
    isProduction,
    isDevelopment: !isProduction,
    debug: import.meta.env.DEV,
    persistence: isProduction
      ? PERSISTENCE.BLOB
      : (PERSISTENCE.MEMORY as Persistence),
    baseUrl: import.meta.env.BASE_URL,
  } as EnvironmentConfig;
}

/** Demo JSON from `src/data/seed/` is loaded only during local development. */
export function shouldUseSeedData(): boolean {
  return import.meta.env.DEV;
}
