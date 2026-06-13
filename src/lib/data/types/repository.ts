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

export type BlobConsistencyMode = "eventual" | "strong";

export type BlobGetOptions = {
  type: "json";
  consistency?: BlobConsistencyMode;
};

export type BlobSetOptions = {
  onlyIfNew?: boolean;
  onlyIfMatch?: string;
  consistency?: BlobConsistencyMode;
};

export type BlobStoreLike = {
  get(key: string, options: BlobGetOptions): Promise<unknown>;
  setJSON(
    key: string,
    data: unknown,
    options?: BlobSetOptions,
  ): Promise<BlobWriteResult>;
};

export type BlobWriteResult = { modified: boolean; etag?: string };
export type Cloneable = FoodItem[] | ConsumptionDay[] | Preferences;
