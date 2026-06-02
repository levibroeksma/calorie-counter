import anchor from '@alpinejs/anchor';
import { appConfig } from './config/app.js';
import { getEnvironmentConfig } from './config/environments.js';
import catalogPage from './pages/catalog.page.js';
import loginPage from './pages/login.page.js';
import settingsPage from './pages/settings.page.js';
import todayPage from './pages/today.page.js';
import trendChart from './pages/trendChart.component.js';
import trendsPage from './pages/trends.page.js';
import appStore from './stores/app.store.js';
import { startDayRolloverWatch } from './stores/dayRollover.client.js';
import modalStore from './stores/modal.store.js';

export default (Alpine) => {
  Alpine.plugin(anchor);

  const config = { app: appConfig, ...getEnvironmentConfig() };

  Alpine.store('config', config);
  Alpine.store('app', config.app);

  const store = appStore();
  Alpine.store('appStore', store);

  const modal = modalStore(Alpine.effect);
  Alpine.store('modalStore', modal);
  store.attachModalStore(modal);
  modal.init();
  startDayRolloverWatch(store);

  Alpine.data('todayPage', todayPage);
  Alpine.data('catalogPage', catalogPage);
  Alpine.data('settingsPage', settingsPage);
  Alpine.data('trendsPage', trendsPage);
  Alpine.data('trendChart', trendChart);
  Alpine.data('loginPage', loginPage);

  void Alpine.store('appStore').loadInitialData();
};
