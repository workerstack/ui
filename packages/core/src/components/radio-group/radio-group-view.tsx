import type { JSX } from "@solidjs/web";

import { ChoiceView, type ChoiceViewProps } from "../view/index.ts";

/** What `RadioGroupView` takes: the group's `items`, its chosen `value` and a `legend`. */
export type RadioGroupViewProps<Value extends string = string> = Omit<ChoiceViewProps<Value>, "value"> & {
  /** The chosen value; `null` or none reads as the empty marker. */
  value?: Value | null;
};

/**
 * A RadioGroup's read-only view: the chosen option's label from the group's `items`, under its
 * `legend` in a named group when it has one.
 */
export function RadioGroupView<Value extends string = string>(props: RadioGroupViewProps<Value>): JSX.Element {
  return <ChoiceView {...props} />;
}
