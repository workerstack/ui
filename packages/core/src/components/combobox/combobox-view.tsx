import type { JSX } from "@solidjs/web";

import { ChoiceView, type ChoiceViewProps } from "../view/index.ts";

/** What `ComboboxView` takes: the combobox's `value`, `items`, `itemToStringLabel` and `itemToColor`. */
export type ComboboxViewProps<Value> = Omit<ChoiceViewProps<Value>, "legend">;

/**
 * A Combobox's read-only view: the chosen item's label, or a multiple combobox's labels joined with
 * commas, from the combobox's own `items` and `itemToStringLabel`; colored items read as badges.
 */
export function ComboboxView<Value>(props: ComboboxViewProps<Value>): JSX.Element {
  return <ChoiceView {...props} />;
}
