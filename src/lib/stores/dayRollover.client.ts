import { isLoggedIn } from "@lib/auth/session.client.js";
import { hasLocalDateChanged } from "@lib/data/date.service.js";
import type { AppStore } from "@lib/domain/types.js";

const ROLLOVER_CHECK_MS = 60_000;

export function startDayRolloverWatch(appStore: AppStore) {
  let inFlight: boolean = false;

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

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      onDateMaybeChanged();
    }
  });

  window.setInterval(onDateMaybeChanged, ROLLOVER_CHECK_MS);
}
