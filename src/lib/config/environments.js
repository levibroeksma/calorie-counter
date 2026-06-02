

/** Persistence backends used by repositories (Phase 2). */
export const PERSISTENCE = {
  MEMORY: 'memory',
  BLOB: 'blob',
};

export function getEnvironmentConfig() {
  const isProduction = import.meta.env.PROD;

  return {
    isProduction,
    isDevelopment: !isProduction,
    debug: import.meta.env.DEV,
    persistence: isProduction ? PERSISTENCE.BLOB : PERSISTENCE.MEMORY,
    baseUrl: import.meta.env.BASE_URL,
  };
}
