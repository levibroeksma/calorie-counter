import { defineAction } from "astro:actions";

import { loadAppData } from "@actions/actionHelpers.server";

// TODO: add authenticatino to the action, checking if user is logged in before loading data
export const loadData = defineAction({
  handler: async () => loadAppData(),
});
