/** Today log row */
export type TodayLogRow = {
  index: number;
  rowName: string;
  portionText: string;
  caloriesText: string;
};

/** Macro stat */
export type MacroStat = {
  label: string;
  key: "calories" | "protein" | "fibres" | "fats" | "carbs";
  achieved: number;
  target: number;
  targetLabel: string;
  fillClass: string;
};
