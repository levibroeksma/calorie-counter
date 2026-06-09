import { isLoggedIn } from "@lib/auth/session.client";
import { hasLocalDateChanged } from "@lib/data/date.service";

import type { AppStore } from "@lib/stores/index";

/** Rollover check interval */
const ROLLOVER_CHECK_MS = 60_000;

/** Starts the day rollover watch */
export function startDayRolloverWatch(appStore: AppStore): void {
  let inFlight: boolean = false;

  /** Checks if the date has changed */
  async function onDateMaybeChanged(): Promise<void> {
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
