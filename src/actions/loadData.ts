import { defineAction } from "astro:actions";
import { loadAppData } from "@actions/actionHelpers.server.js";

export const loadData = defineAction({
  handler: async () => loadAppData(),
});
