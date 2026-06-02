import { addConsumption } from './addConsumption.js';
import { createItem } from './createItem.js';
import { ensureToday } from './ensureToday.js';
import { loadData } from './loadData.js';
import { login } from './login.js';
import { removeConsumption } from './removeConsumption.js';
import { updateItem } from './updateItem.js';
import { updatePreferences } from './updatePreferences.js';

/**
 * Central Astro Actions registry.
 * @type {import('astro:actions').SSRActions}
 */
export const server = {
  login,
  loadData,
  ensureToday,
  addConsumption,
  removeConsumption,
  createItem,
  updateItem,
  updatePreferences,
};
