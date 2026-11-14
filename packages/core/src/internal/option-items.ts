import type { ListData, ListItem } from "@ui-sdk/solid/select";

// The options of a choice control as UI SDK's Select and Combobox take them (`items`): plain
// strings, `{ value, label }` items, labeled groups and separators. Views and cells read a value's
// label, color or full entry from the same list the control renders.

/** An option's color: a status tone, or one of six chart hues for labels that are not statuses. */
export type OptionColor =
  | "accent"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "danger"
  | "info"
  | "neutral"
  | "success"
  | "warning";

/** A Select or Combobox item, with the extras a view or cell reads. */
export type OptionItem<Value = string> = ListItem<Value> & {
  /** A dot in lists, a badge in views and cells. */
  color?: OptionColor;
  /** A card option's secondary line. */
  description?: string;
};

/** The `items` of a Select or Combobox: strings, items, groups of them, separators. */
export type OptionItems<Value = string> = ListData<Value, OptionItem<Value>>;

function isText<Value>(entry: OptionItems<Value>[number]): entry is Value & string {
  return typeof entry === "string";
}

// Groups and separators are the only list entries with a `type`; an item has none.
function isListItem<Value>(entry: OptionItems<Value>[number]): entry is OptionItem<Value> {
  return typeof entry === "object" && !("type" in entry);
}

/**
 * The options as flat `{ value, label }` items, in order: a string is its own label, a group's
 * items follow in place and separators are dropped.
 */
export function optionEntries<Value>(items: OptionItems<Value> | undefined): OptionItem<Value>[] {
  return (items ?? []).flatMap((entry): OptionItem<Value>[] => {
    if (isText(entry)) return [{ label: entry, value: entry }];

    if (isListItem(entry)) return [entry];

    return entry.type === "group" ? optionEntries(entry.items) : [];
  });
}

/** The label `value` shows with, or `""` for no value; an unknown value reads as itself. */
export function optionLabel<Value>(
  items: OptionItems<Value> | undefined,
  value: Value | null | undefined,
  toLabel?: (value: Value) => string,
): string {
  if (value === null || value === undefined || value === "") return "";

  if (toLabel !== undefined) return toLabel(value);

  return optionEntries(items).find((entry) => entry.value === value)?.label ?? String(value);
}

/** The labels of several values, in their order. */
export function optionLabels<Value>(
  items: OptionItems<Value> | undefined,
  values: readonly Value[],
  toLabel?: (value: Value) => string,
): string[] {
  return values.map((value) => optionLabel(items, value, toLabel));
}

/** The color `value`'s option carries, if any. */
export function optionColor<Value>(
  items: OptionItems<Value> | undefined,
  value: Value | null | undefined,
): OptionColor | undefined {
  if (value === null || value === undefined) return undefined;

  return optionEntries(items).find((entry) => entry.value === value)?.color;
}
