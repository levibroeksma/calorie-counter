import type { PERSISTENCE } from "@config/environments";

export type AppConfig = {
  name: string;
  version: string;
  description: string;
};

export type Persistence = (typeof PERSISTENCE)[keyof typeof PERSISTENCE];

export type EnvironmentConfig = {
  isProduction: boolean;
  isDevelopment: boolean;
  debug: boolean;
  persistence: Persistence;
  baseUrl: string;
};
