import type { JSX } from "@solidjs/web";
import {
  Popover as PopoverPart,
  PopoverClose as PopoverClosePart,
  PopoverContent as PopoverContentPart,
  PopoverDescription as PopoverDescriptionPart,
  PopoverTitle as PopoverTitlePart,
  PopoverTrigger as PopoverTriggerPart,
} from "@ui-sdk/solid/popover";
import { omit, type ComponentProps } from "solid-js";

import { popupMotion } from "../../internal/index.ts";
import { cn, cnState } from "../../utils/cn/index.ts";

/** A floating panel with rich content, opened from a button. Holds open state; renders no element. */
export { PopoverPart as Popover };

export type { PopoverProps } from "@ui-sdk/solid/popover";

/** UI SDK's popover trigger props. */
export type PopoverTriggerProps = ComponentProps<typeof PopoverTriggerPart>;

/** Opens the popover. Unstyled: give it `class={buttonClass()}` or render your own Button. */
export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element {
  return <PopoverTriggerPart {...props} />;
}

/** UI SDK's popover close props. */
export type PopoverCloseProps = ComponentProps<typeof PopoverClosePart>;

/** Closes the popover. Unstyled, like PopoverTrigger. */
export function PopoverClose(props: PopoverCloseProps): JSX.Element {
  return <PopoverClosePart {...props} />;
}

/** UI SDK's popover content props: `side`, `align`, `sideOffset`, `initialFocus`, `finalFocus`. */
export type PopoverContentProps = ComponentProps<typeof PopoverContentPart>;

/** The panel, placed against its trigger. Name it with a PopoverTitle. */
export function PopoverContent(props: PopoverContentProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <PopoverContentPart
      {...rest}
      class={cnState(
        ["z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-popup outline-none", popupMotion],
        props.class,
      )}
    />
  );
}

/** Title and description, stacked. */
export function PopoverHeader(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} class={cn("flex flex-col gap-1 text-sm", props.class)} />;
}

/** UI SDK's popover title props. */
export type PopoverTitleProps = ComponentProps<typeof PopoverTitlePart>;

/** Names the popover. */
export function PopoverTitle(props: PopoverTitleProps): JSX.Element {
  const rest = omit(props, "class");

  return <PopoverTitlePart {...rest} class={cnState("leading-none font-medium", props.class)} />;
}

/** UI SDK's popover description props. */
export type PopoverDescriptionProps = ComponentProps<typeof PopoverDescriptionPart>;

/** Describes the popover. */
export function PopoverDescription(props: PopoverDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return <PopoverDescriptionPart {...rest} class={cnState("text-sm text-muted-foreground", props.class)} />;
}
