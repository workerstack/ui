import type { JSX } from "@solidjs/web";
import {
  Radio as RadioPart,
  RadioGroup as RadioGroupPart,
  RadioIndicator,
  type RadioGroupOptions,
} from "@ui-sdk/solid/radio";
import { omit, untrack, type ComponentProps } from "solid-js";

import { callRef, createRequiredChoice } from "../../internal/index.ts";
import { VALIDITY_MESSAGES_EN } from "../../internal/validity.messages.ts";
import { cn, cnState, type ClassValue } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";

/** What a RadioGroup tells `onValueChange` about the change: its `reason` and `cancel()`. */
export type RadioGroupChangeDetails<Value extends string = string> = Parameters<
  NonNullable<RadioGroupOptions<Value>["onValueChange"]>
>[1];

/**
 * A radio group's props: `value`, `defaultValue`, `name`, `disabled`, `readOnly`, `required`,
 * `loop` and `controller`. The value's type comes from `value`, `defaultValue` or the handler's
 * parameter, and is `string` given none of them. `null` chooses none.
 */
export type RadioGroupProps<Value extends string = string> = Omit<
  ComponentProps<typeof RadioGroupPart<Value>>,
  "onValueChange"
> & {
  /** An option was chosen. Never called with none: a choice can be changed, not undone. */
  onValueChange?: (value: Value, details: RadioGroupChangeDetails<Value>) => void;
};

// The group's hidden radio inputs, which carry its native `required`.
function radioInputs(group: HTMLElement | undefined): HTMLInputElement[] {
  return [...(group?.querySelectorAll<HTMLInputElement>('[data-slot="radio-input"]') ?? [])];
}

/**
 * Radios that share one value, with one tab stop and arrow keys between them. Put it in a Field
 * and the field's label names the group. Without a Field, name it with `aria-label`. `readOnly`
 * shows the choice without letting it change. While `required` and nothing is chosen it reports
 * the provider's `requiredChoice`; the Field's label is marked through `useRequiredMark`.
 */
export function RadioGroup<Value extends string = string>(props: RadioGroupProps<Value>): JSX.Element {
  const rest = omit(props, "class", "onValueChange", "ref");
  const messages = useUiMessages(VALIDITY_MESSAGES_EN);
  let group: HTMLElement | undefined;

  const chosen = createRequiredChoice<Value | null>({
    controlled: () => props.value !== undefined,
    initial: untrack(() => props.defaultValue) ?? null,
    inputs: () => radioInputs(group),
    isMissing: (value) => value === null,
    message: () => messages.requiredChoice,
    required: () => props.required,
    value: () => props.value ?? null,
  });

  return (
    <RadioGroupPart<Value>
      {...rest}
      ref={(element) => {
        group = element;
        callRef(() => props.ref, element);
      }}
      onValueChange={(value, details) => {
        chosen.set(value);

        if (value !== null) props.onValueChange?.(value, details);
      }}
      class={cnState("group/radio-group grid gap-3", props.class)}
    />
  );
}

/**
 * A radio option's props: `value`, `disabled`, and the label as `children`. `class` styles the
 * label; the rest go to the radio.
 */
export type RadioProps = Omit<ComponentProps<typeof RadioPart>, "children" | "class"> & {
  /** The option's label. */
  children?: JSX.Element;
  /** Class names for the label. */
  class?: ClassValue;
};

/** One option of a RadioGroup: a radio, its dot and its label. Clicking the label chooses it. */
export function Radio(props: RadioProps): JSX.Element {
  const rest = omit(props, "class", "children");

  return (
    <label
      class={cn(
        "flex w-fit cursor-pointer gap-2 text-sm",
        "has-data-disabled:cursor-not-allowed has-data-readonly:cursor-default",
        props.class,
      )}
    >
      <RadioPart
        {...rest}
        class={cn([
          "peer mt-[calc((1lh-1rem)/2)] aspect-square size-4 shrink-0 rounded-full border border-input text-primary",
          "shadow-xs outline-none transition-[color,box-shadow] delay-0",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-checked:border-primary aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "group-aria-invalid/radio-group:border-destructive group-aria-invalid/radio-group:ring-destructive/20",
          "group-aria-invalid/radio-group:data-checked:border-destructive",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          // Read-only keeps the look and loses the feedback: no pointer, no resting shadow.
          "data-readonly:cursor-default data-readonly:shadow-none",
        ])}
      >
        <RadioIndicator />
      </RadioPart>
      <span class="peer-data-disabled:opacity-50">{props.children}</span>
    </label>
  );
}
