import type { OptionItems } from "../option-items.ts";

/** Statuses with colors, one outside any group, two groups and a separator. */
export const STATUSES: OptionItems = [
  { color: "neutral", label: "Backlog", value: "backlog" },
  { label: "Unsorted", value: "unsorted" },
  { type: "separator" },
  {
    items: [
      { color: "info", label: "In review", value: "review" },
      { color: "chart-2", label: "Ready", value: "ready" },
    ],
    label: "Active",
    type: "group",
  },
  { items: ["Shipped"], type: "group" },
];

/** Plain strings, each its own label. */
export const LANGUAGES: OptionItems = ["Go", "Rust"];

/** An item with a description. */
export const PLANS: OptionItems = [{ description: "Monthly", label: "Pro plan", value: "pro" }];

/** An object value; labels come from `toLabel`. */
export type Person = { id: number; name: string };

/** The same person, held in two places. */
export const ADA: Person = { id: 7, name: "Ada" };
