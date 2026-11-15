import type { ChoiceViewProps } from "../../view/index.ts";

// A list Root's `itemToLabel`, as the read-only views take it (`itemToStringLabel`).

/** What a list field's Root may hold: a value's label. */
type LabelSource<TValue> = {
  /** A value's label, when the items can't tell it. */
  itemToLabel?: (value: TValue) => string;
};

/** The view's label prop. */
type StringLabel<TValue> = Pick<ChoiceViewProps<TValue>, "itemToStringLabel">;

/** The view's `itemToStringLabel`, present only when the Root was given an `itemToLabel`. */
export function stringLabel<TValue>(root: LabelSource<TValue>): StringLabel<TValue> {
  if (!("itemToLabel" in root)) return {};

  return { itemToStringLabel: (value) => root.itemToLabel?.(value) ?? String(value) };
}
