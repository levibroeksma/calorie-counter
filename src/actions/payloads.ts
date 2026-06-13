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
export type AddConsumptionPayload = Pick<
  LoadDataPayload,
  "today" | "consumption"
> & { entry: ConsumptionEntry };

/** Remove consumption payload */
export type RemoveConsumptionPayload = Pick<
  LoadDataPayload,
  "today" | "consumption"
> & { removedIndex: number };

/** Create item payload */
export type CreateItemPayload = Pick<
  LoadDataPayload,
  "items" | "consumption"
> & {
  item: FoodItem;
  logged: boolean;
};

/** Update item payload */
export type UpdateItemPayload = Pick<LoadDataPayload, "items"> & {
  item: FoodItem;
};

/** Update preferences payload */
export type UpdatePreferencesPayload = {
  preferences: Preferences;
};

/** Login payload */
export type LoginPayload = {
  success: boolean;
  writeToken: string;
};
