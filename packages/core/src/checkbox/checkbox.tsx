import type { JSX } from "@solidjs/web";
import {
  Checkbox as CheckboxPart,
  CheckboxGroup as CheckboxGroupPart,
  CheckboxIndicator,
} from "@ui-sdk/solid/checkbox";
import { omit, untrack, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { callRef, createRequiredChoice, createRequiredToggle, siblingInput } from "../internal/index.ts";
import { useUiMessages } from "../provider/index.ts";

const BOX = [
  "peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px]",
  "border border-input bg-transparent text-primary-foreground shadow-xs outline-none",
  "transition-[color,box-shadow] delay-0 focus-visible:border-ring focus-visible:ring-3",
  "focus-visible:ring-ring/50",
  "data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary",
  "data-indeterminate:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
  // Read-only keeps the look and loses the feedback: no pointer, no resting shadow.
  "data-readonly:cursor-default data-readonly:shadow-none",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
];

/**
 * UI SDK's checkbox props: `checked`, `defaultChecked` (`true`, `false` or `"indeterminate"`),
 * `onCheckedChange`, `value`, `name`, `disabled`, `readOnly`, `required`, and `parent`.
 */
export type CheckboxProps = ComponentProps<typeof CheckboxPart>;

/**
 * A checkbox. Inside a Field it takes the field's label, name and validation. Inside a
 * CheckboxGroup it joins the group's value; with `parent` it is the group's "select all" and shows
 * a mark for some. UI SDK draws the check and the mark. While `required` and unticked it reports
 * the provider's `requiredTick`.
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  const rest = omit(props, "class", "children", "onCheckedChange", "ref");
  const messages = useUiMessages();
  const toggle = createRequiredToggle(props, { message: () => messages.requiredTick, part: "checkbox-input" });

  return (
    <CheckboxPart {...rest} ref={toggle.ref} onCheckedChange={toggle.onCheckedChange} class={cnState(BOX, props.class)}>
      <CheckboxIndicator class="pointer-events-none flex items-center justify-center [--ui-icon-size:0.875rem]" />
    </CheckboxPart>
  );
}

/**
 * UI SDK's checkbox group props: `value`, `defaultValue`, `onValueChange`, `allValues`, `name`,
 * `disabled`, `readOnly` (every checkbox shows its state and cannot change) and `required` (at
 * least one must be checked).
 */
export type CheckboxGroupProps<Value extends string = string> = ComponentProps<typeof CheckboxGroupPart<Value>>;

/**
 * Checkboxes that share a list of checked values. Each Checkbox's `value` is its item. Put the
 * group, not each checkbox, in a Field. While `required` and nothing is checked it reports the
 * provider's `requiredChoice`; the group element never takes `required` itself, so the Field's
 * label is marked through `useRequiredMark`.
 */
export function CheckboxGroup<Value extends string = string>(props: CheckboxGroupProps<Value>): JSX.Element {
  const rest = omit(props, "class", "onValueChange", "ref");
  const messages = useUiMessages();
  let group: HTMLElement | undefined;

  const picked = createRequiredChoice<readonly Value[]>({
    controlled: () => props.value !== undefined,
    initial: untrack(() => props.defaultValue) ?? [],
    inputs: () => siblingInput(group, "checkbox-group-input"),
    isMissing: (value) => value.length === 0,
    message: () => messages.requiredChoice,
    required: () => props.required,
    value: () => props.value ?? [],
  });

  return (
    <CheckboxGroupPart<Value>
      {...rest}
      ref={(element) => {
        group = element;
        callRef(() => props.ref, element);
      }}
      onValueChange={(next, details) => {
        picked.set(next);
        props.onValueChange?.(next, details);
      }}
      class={cnState("flex flex-col gap-2", props.class)}
    />
  );
}
