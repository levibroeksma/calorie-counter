import { isLoggedIn } from '../auth/session.client.js';
import { hasLocalDateChanged } from '../data/date.service.js';

const ROLLOVER_CHECK_MS = 60_000;

export function startDayRolloverWatch(appStore) {
  let inFlight = false;

  async function onDateMaybeChanged() {
    if (inFlight || !isLoggedIn()) {
      return;
    }

    if (!hasLocalDateChanged(appStore.today)) {
      return;
    }

    inFlight = true;

    try {
      await appStore.ensureToday();
      appStore.resetAddFlow();
    } finally {
      inFlight = false;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      onDateMaybeChanged();
    }
  });

  window.setInterval(onDateMaybeChanged, ROLLOVER_CHECK_MS);
}
