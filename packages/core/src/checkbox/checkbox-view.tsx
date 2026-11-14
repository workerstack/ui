import type { JSX } from "@solidjs/web";

import { BooleanView, type BooleanViewProps, ChoiceView, type ChoiceViewProps } from "../view/index.ts";

/** A Checkbox's read-only view: "Yes" or "No" from the provider's `viewYes` and `viewNo`. */
export function CheckboxView(props: BooleanViewProps): JSX.Element {
  return <BooleanView {...props} />;
}

/** What `CheckboxGroupView` takes: the group's `items`, its checked `value`s and a `legend`. */
export type CheckboxGroupViewProps<Value extends string = string> = Omit<ChoiceViewProps<Value>, "value"> & {
  /** The checked values. */
  value?: readonly Value[] | null;
};

/**
 * A CheckboxGroup's read-only view: the checked values' labels joined with commas (the empty
 * marker for none), from the group's `items`, under its `legend` in a named group when it has one.
 */
export function CheckboxGroupView<Value extends string = string>(props: CheckboxGroupViewProps<Value>): JSX.Element {
  return <ChoiceView {...props} />;
}
