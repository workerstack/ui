import type { OptionItem } from "../../../internal/index.ts";

/** Priorities: two colored options and a plain one. */
export const PRIORITY: OptionItem<string>[] = [
  { color: "danger", label: "Urgent", value: "urgent" },
  { color: "warning", label: "High", value: "high" },
  { label: "Normal", value: "normal" },
];
