import type { OptionItem } from "../../internal/index.ts";

/** The plans a RadioGroupView reads its labels from. */
export const PLAN_ITEMS: OptionItem<string>[] = [
  { label: "Starter", value: "starter" },
  { label: "Business", value: "business" },
];
