import type { ConsumptionDay } from "@lib/domain/types/consumption";
import type { Preferences } from "@lib/domain/types/userPreference";
import type { FoodItem } from "@lib/domain/types/food";

export const BLOB_STORE_KEYS = {
  ITEMS: "items",
  CONSUMPTION: "consumption",
  PREFERENCES: "preferences",
} as const;

export type BlobStoreKey =
  (typeof BLOB_STORE_KEYS)[keyof typeof BLOB_STORE_KEYS];

export interface DataRepository {
  getItems(): Promise<FoodItem[]>;
  setItems(items: FoodItem[]): Promise<void>;
  getConsumption(): Promise<ConsumptionDay[]>;
  setConsumption(consumption: ConsumptionDay[]): Promise<void>;
  getPreferences(): Promise<Preferences>;
  setPreferences(preferences: Preferences): Promise<void>;
}

export type BlobStoreLike = {
  get(key: string, options: { type: "json" }): Promise<unknown>;
  setJSON(key: string, data: unknown): Promise<BlobWriteResult>;
};

export type BlobWriteResult = { modified: boolean; etag?: string };
export type Cloneable = FoodItem[] | ConsumptionDay[] | Preferences;
