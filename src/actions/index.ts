import { addConsumption } from "@actions/addConsumption.js";
import { createItem } from "@actions/createItem.js";
import { ensureToday } from "@actions/ensureToday.js";
import { loadData } from "@actions/loadData.js";
import { login } from "@actions/login.js";
import { removeConsumption } from "@actions/removeConsumption.js";
import { updateItem } from "@actions/updateItem.js";
import { updatePreferences } from "@actions/updatePreferences.js";

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
