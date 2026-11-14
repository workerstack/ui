import type { JSX } from "@solidjs/web";
import {
  Checkbox as CheckboxPart,
  CheckboxGroup as CheckboxGroupPart,
  CheckboxIndicator,
} from "@ui-sdk/solid/checkbox";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";

/**
 * UI SDK's checkbox props: `checked`, `defaultChecked` (`true`, `false` or `"indeterminate"`),
 * `onCheckedChange`, `value`, `name`, `disabled`, `readOnly`, `required`, and `parent`.
 */
export type CheckboxProps = ComponentProps<typeof CheckboxPart>;

/**
 * A checkbox. Inside a Field it takes the field's label, name and validation. Inside a
 * CheckboxGroup it joins the group's value; with `parent` it is the group's "select all" and shows
 * a mark for some. UI SDK draws the check and the mark.
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  const rest = omit(props, "class", "children");

  return (
    <CheckboxPart
      {...rest}
      class={cnState(
        [
          "peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px]",
          "border border-input bg-transparent text-primary-foreground shadow-xs outline-none",
          "transition-[color,box-shadow] delay-0 focus-visible:border-ring focus-visible:ring-3",
          "focus-visible:ring-ring/50",
          "data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary",
          "data-indeterminate:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
          "data-readonly:cursor-default aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        ],
        props.class,
      )}
    >
      <CheckboxIndicator class="pointer-events-none flex items-center justify-center [--ui-icon-size:0.875rem]" />
    </CheckboxPart>
  );
}

/** UI SDK's checkbox group props: `value`, `defaultValue`, `onValueChange`, `allValues`, `name`, `disabled`. */
export type CheckboxGroupProps<Value extends string = string> = ComponentProps<typeof CheckboxGroupPart<Value>>;

/**
 * Checkboxes that share a list of checked values. Each Checkbox's `value` is its item. Put the
 * group, not each checkbox, in a Field.
 */
export function CheckboxGroup<Value extends string = string>(props: CheckboxGroupProps<Value>): JSX.Element {
  const rest = omit(props, "class");

  return <CheckboxGroupPart {...rest} class={cnState("flex flex-col gap-2", props.class)} />;
}
