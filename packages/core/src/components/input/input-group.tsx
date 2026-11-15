import type { JSX } from "@solidjs/web";
import { Button as ButtonPart } from "@ui-sdk/solid/button";
import { InputGroup as InputGroupPart } from "@ui-sdk/solid/input";
import { omit, type ComponentProps } from "solid-js";

import { fieldBox } from "../../internal/index.ts";
import { cn, cnState, type ClassValue } from "../../utils/cn/index.ts";
import { buttonClass, type ButtonVariant } from "../button/index.ts";

/** UI SDK's input group props. */
export type InputGroupProps = ComponentProps<typeof InputGroupPart>;

const GROUP: ClassValue[] = [
  fieldBox,
  "gap-2 px-3 [&>input]:h-full [&>input]:min-w-0 [&>input]:flex-1 [&>input]:border-0",
  "[&>input]:bg-transparent [&>input]:p-0 [&>input]:shadow-none [&>input]:ring-0",
  "[&>span]:text-muted-foreground",
  // A textarea or an addon above or below the control stacks the group, taller than a line.
  "has-[>textarea]:h-auto has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-start]]:h-auto",
  "has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:flex-col",
  "has-[>[data-align=block-end]]:items-stretch has-[>[data-align=block-start]]:items-stretch",
  "has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-3",
  "has-[textarea:focus-visible]:ring-ring/50 has-[textarea[aria-invalid=true]]:border-destructive",
  // A read-only control inside shows its value, not a box: the group drops its border and fill.
  "has-[[data-readonly]]:border-transparent has-[[data-readonly]]:bg-transparent has-[[data-readonly]]:shadow-none",
];

/**
 * Holds text, icons or buttons around an Input or a Textarea, drawn as one control. It rings for
 * the control inside and drops its border and fill while that control is read-only. Pressing an
 * addon's text or icon focuses the control.
 */
export function InputGroup(props: InputGroupProps): JSX.Element {
  const rest = omit(props, "class");

  return <InputGroupPart {...rest} class={cnState(GROUP, props.class)} />;
}

/** Where an addon sits in its group. */
export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

/** What `InputGroupAddon` takes. */
export type InputGroupAddonProps = JSX.HTMLAttributes<HTMLDivElement> & {
  /** Beside the control (`inline-*`) or above or below it, full width (`block-*`). @default "inline-start" */
  align?: InputGroupAddonAlign;
  /** Extra classes; they win over the addon's own. */
  class?: string | undefined;
};

const ALIGN: Record<InputGroupAddonAlign, string> = {
  "block-end": "order-last w-full justify-start pb-2",
  "block-start": "order-first w-full justify-start pt-2",
  "inline-end": "order-last",
  "inline-start": "order-first",
};

/** An addon around a group's control: text, an icon or a button, before it, after it, above or below. */
export function InputGroupAddon(props: InputGroupAddonProps): JSX.Element {
  const rest = omit(props, "align", "class");

  function align(): InputGroupAddonAlign {
    return props.align ?? "inline-start";
  }

  return (
    <div
      {...rest}
      data-slot="input-group-addon"
      data-align={align()}
      class={cn(
        "flex cursor-text items-center justify-center gap-2 text-sm font-medium text-muted-foreground select-none",
        "[&>svg:not([class*='size-'])]:size-4",
        ALIGN[align()],
        props.class,
      )}
    />
  );
}

/** What `InputGroupText` takes. */
export type InputGroupTextProps = JSX.HTMLAttributes<HTMLSpanElement> & {
  /** Extra classes; they win over the text's own. */
  class?: string | undefined;
};

/** Plain text in an addon: a unit, a prefix, a domain. */
export function InputGroupText(props: InputGroupTextProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <span
      {...rest}
      class={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none",
        "[&_svg:not([class*='size-'])]:size-4",
        props.class,
      )}
    />
  );
}

/** What `InputGroupButton` takes. */
export type InputGroupButtonProps = ComponentProps<typeof ButtonPart> & {
  /** Fits inside the group: 24px (`xs`) or 32px (`sm`) tall. @default "xs" */
  size?: "xs" | "sm";
  /** How the button looks. @default "ghost" */
  variant?: ButtonVariant;
};

/** A button inside a group's addon, sized to sit in the box. */
export function InputGroupButton(props: InputGroupButtonProps): JSX.Element {
  const rest = omit(props, "class", "size", "variant");

  return (
    <ButtonPart
      {...rest}
      class={cnState(
        cn(buttonClass({ size: props.size ?? "xs", variant: props.variant ?? "ghost" }), "shadow-none"),
        props.class,
      )}
    />
  );
}
