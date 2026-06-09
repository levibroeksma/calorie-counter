import type {
  FoodItem,
  LocalDate,
  Macro,
  ReferenceUnit,
  PortionInvalidReason,
} from "@lib/domain/index";

/** Raw consumption entry */
export type ConsumptionEntry = {
  itemId: number;
  amount: number;
  unit: ReferenceUnit;
};
/** Resolved consumption entry */
export type ResolvedConsumptionEntry = ConsumptionEntry & {
  index: number;
  isUnknown: boolean;
  isValid: boolean;
  item: FoodItem | undefined;
  displayName: string | null;
  macros: Macro | null | undefined;
  invalidReason?: PortionInvalidReason;
};

/** Consumption day */
export type ConsumptionDay = {
  date: LocalDate;
  consumed: ConsumptionEntry[];
};
