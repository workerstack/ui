import type { JSX } from "@solidjs/web";

import { ChoiceView, type ChoiceViewProps } from "../view/index.ts";

/** What `SelectView` takes: a Select's `items` and `itemToStringLabel`, and the chosen `value`. */
export type SelectViewProps<Value> = Omit<ChoiceViewProps<Value>, "legend">;

/** The read-only view of a Select: the chosen item's label, looked up in the Select's own `items`. */
export function SelectView<Value>(props: SelectViewProps<Value>): JSX.Element {
  return <ChoiceView {...props} />;
}
