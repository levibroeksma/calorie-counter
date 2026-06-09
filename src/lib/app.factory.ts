import anchor from "@alpinejs/anchor";

import type { Alpine } from "alpinejs";
import type { AppStore } from "@lib/stores/index.js";

import { appConfig } from "@config/app.js";
import { getEnvironmentConfig } from "@config/environments.js";
import { startDayRolloverWatch } from "@stores/dayRollover.client.js";

import appStore from "@stores/app.store.js";
import modalStore from "@stores/modal.store.js";

import loginPage from "@lib/pages/login.page.js";
import todayPage from "@lib/pages/today.page.js";
import trendsPage from "@lib/pages/trends.page.js";
import settingsPage from "@lib/pages/settings.page.js";
import catalogPage from "@lib/pages/catalog.page.js";

import trendChart from "@lib/pages/trendChart.component.js";

export default (Alpine: Alpine): void => {
  Alpine.plugin(anchor);

  const appStoreInstance = appStore() as AppStore;

  const config = { app: appConfig, ...getEnvironmentConfig() };

  Alpine.store("config", config);
  Alpine.store("app", config.app);

  Alpine.store("appStore", appStoreInstance);

  const modal = modalStore(Alpine.effect);
  Alpine.store("modalStore", modal);
  appStoreInstance.attachModalStore(modal);
  modal.init();
  startDayRolloverWatch(appStoreInstance);

  Alpine.data("todayPage", todayPage);
  Alpine.data("catalogPage", catalogPage);
  Alpine.data("settingsPage", settingsPage);
  Alpine.data("trendsPage", trendsPage);
  Alpine.data("trendChart", trendChart);
  Alpine.data("loginPage", loginPage);

  void Alpine.store("appStore").loadInitialData();
};
