import { addConsumption } from "@actions/addConsumption";
import { createItem } from "@actions/createItem";
import { ensureToday } from "@actions/ensureToday";
import { loadData } from "@actions/loadData";
import { login } from "@actions/login";
import { removeConsumption } from "@actions/removeConsumption";
import { updateItem } from "@actions/updateItem";
import { updatePreferences } from "@actions/updatePreferences";

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
