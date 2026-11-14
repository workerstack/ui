import type { JSX } from "@solidjs/web";
import {
  Drawer as DrawerPart,
  DrawerBackdrop,
  DrawerClose as DrawerClosePart,
  DrawerContent as DrawerContentPart,
  DrawerDescription as DrawerDescriptionPart,
  DrawerHandle as DrawerHandlePart,
  DrawerTitle as DrawerTitlePart,
  DrawerTrigger as DrawerTriggerPart,
} from "@ui-sdk/solid/drawer";
import { omit, Show, type ComponentProps } from "solid-js";

import { cn, cnState } from "../cn/index.ts";
import { withBefore } from "../internal/index.ts";

/**
 * A sheet that slides in from an edge and can be swiped shut. Holds open state; renders no element.
 * `side` picks the edge: "bottom" (the default), "top", "left", "right", or "start" and "end", which
 * follow the writing direction.
 */
export { DrawerPart as Drawer };

export type { DrawerProps, DrawerSide } from "@ui-sdk/solid/drawer";

/** UI SDK's drawer trigger props. */
export type DrawerTriggerProps = ComponentProps<typeof DrawerTriggerPart>;

/** Opens the drawer. Unstyled: give it `class={buttonClass()}` or render your own Button. */
export function DrawerTrigger(props: DrawerTriggerProps): JSX.Element {
  return <DrawerTriggerPart {...props} />;
}

/** UI SDK's drawer close props. */
export type DrawerCloseProps = ComponentProps<typeof DrawerClosePart>;

/** Closes the drawer. Unstyled, like DrawerTrigger. */
export function DrawerClose(props: DrawerCloseProps): JSX.Element {
  return <DrawerClosePart {...props} />;
}

/** UI SDK's drawer content props, plus the grab bar switch. */
export type DrawerContentProps = ComponentProps<typeof DrawerContentPart> & {
  /**
   * Shows a grab bar at the top of a bottom drawer. Defaults to true. Turn it off to place a
   * `DrawerHandle` yourself, as a drawer with snap points does.
   */
  showHandle?: boolean;
};

// The drawer slides the backdrop's opacity and the window's position itself, so neither has a transition.
const BACKDROP = "fixed inset-0 z-50 bg-overlay";

const WINDOW = [
  "group/drawer-content flex flex-col gap-4 border bg-background p-4 text-foreground shadow-popup outline-none",
  "data-[side=bottom]:max-h-[80dvh] data-[side=bottom]:w-full data-[side=bottom]:max-w-none",
  "data-[side=bottom]:rounded-t-lg data-[side=bottom]:border-b-0",
  "data-[side=top]:max-h-[80dvh] data-[side=top]:w-full data-[side=top]:max-w-none",
  "data-[side=top]:rounded-b-lg data-[side=top]:border-t-0",
  "data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-l-0 sm:data-[side=left]:max-w-sm",
  "data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-r-0 sm:data-[side=right]:max-w-sm",
];

const GRAB_BAR =
  "mx-auto hidden h-1.5 w-24 shrink-0 rounded-full bg-muted group-data-[side=bottom]/drawer-content:block";

const HANDLE =
  "mx-auto h-1.5 w-24 shrink-0 cursor-pointer rounded-full border-0 bg-muted p-0 outline-none " +
  "focus-visible:ring-3 focus-visible:ring-ring/50";

/** The drawer's sheet, flush with its edge over a dimmed backdrop. */
export function DrawerContent(props: DrawerContentProps): JSX.Element {
  const rest = omit(props, "class", "children", "showHandle");

  return (
    <>
      <DrawerBackdrop class={BACKDROP} />
      <DrawerContentPart {...rest} class={cnState(WINDOW, props.class)}>
        {withBefore(
          <Show when={props.showHandle !== false}>
            <div aria-hidden="true" data-slot="drawer-grab-bar" class={GRAB_BAR} />
          </Show>,
          props.children,
        )}
      </DrawerContentPart>
    </>
  );
}

/** UI SDK's drawer handle props. */
export type DrawerHandleProps = ComponentProps<typeof DrawerHandlePart>;

/**
 * A button styled as the grab bar. Pressing it moves to the next snap point, and arrow keys, Home and
 * End step. Name it with `aria-label`, and set `showHandle={false}` on the content.
 */
export function DrawerHandle(props: DrawerHandleProps): JSX.Element {
  const rest = omit(props, "class");

  return <DrawerHandlePart {...rest} class={cnState(HANDLE, props.class)} />;
}

/** Title and description, stacked. */
export function DrawerHeader(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} class={cn("flex flex-col gap-1.5 text-center sm:text-left", props.class)} />;
}

/** Actions, stacked at the bottom of the sheet. */
export function DrawerFooter(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} class={cn("mt-auto flex flex-col gap-2", props.class)} />;
}

/** UI SDK's drawer title props. */
export type DrawerTitleProps = ComponentProps<typeof DrawerTitlePart>;

/** Names the drawer. */
export function DrawerTitle(props: DrawerTitleProps): JSX.Element {
  const rest = omit(props, "class");

  return <DrawerTitlePart {...rest} class={cnState("text-lg leading-none font-semibold", props.class)} />;
}

/** UI SDK's drawer description props. */
export type DrawerDescriptionProps = ComponentProps<typeof DrawerDescriptionPart>;

/** Describes the drawer. */
export function DrawerDescription(props: DrawerDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return <DrawerDescriptionPart {...rest} class={cnState("text-sm text-muted-foreground", props.class)} />;
}
