export const BLOB_STORE_KEYS = {
  ITEMS: "items",
  CONSUMPTION: "consumption",
  PREFERENCES: "preferences",
} as const;

export type BlobStoreKey =
  (typeof BLOB_STORE_KEYS)[keyof typeof BLOB_STORE_KEYS];
