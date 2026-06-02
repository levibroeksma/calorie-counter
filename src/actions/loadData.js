import { defineAction } from 'astro:actions';
import { loadAppData } from './actionHelpers.server.js';

export const loadData = defineAction({
  handler: async () => loadAppData(),
});
