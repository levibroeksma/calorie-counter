import type {
  LocalDate,
  FoodItem,
  ConsumptionDay,
  Preferences,
  ConsumptionEntry,
} from "@lib/domain/index";

/** Load data payload */
export type LoadDataPayload = {
  items: FoodItem[];
  consumption: ConsumptionDay[];
  preferences: Preferences;
  today: LocalDate;
};

/** Ensure today payload */
export type EnsureTodayPayload = LoadDataPayload & {
  created: boolean;
};

/** Add consumption payload */
export type AddConsumptionPayload = {
  today: LocalDate;
  consumption: ConsumptionDay[];
  entry: ConsumptionEntry;
};

/** Remove consumption payload */
export type RemoveConsumptionPayload = {
  today: LocalDate;
  consumption: ConsumptionDay[];
  removedIndex: number;
};

/** Create item payload */
export type CreateItemPayload = {
  item: FoodItem;
  items: FoodItem[];
  consumption: ConsumptionDay[];
  logged: boolean;
};

/** Update item payload */
export type UpdateItemPayload = {
  item: FoodItem;
  items: FoodItem[];
};

/** Update preferences payload */
export type UpdatePreferencesPayload = {
  preferences: Preferences;
};
