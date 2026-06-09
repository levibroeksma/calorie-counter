import type { AppConfig } from "@lib/config/index";

/** Application metadata (injected into Alpine `app` / `config` stores). */
export const appConfig: AppConfig = {
  name: "Calorie Tracker",
  version: "0.0.1",
  description: "Mobile calorie and macro tracker",
} as AppConfig;
