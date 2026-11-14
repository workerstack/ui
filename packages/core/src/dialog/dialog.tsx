import type { JSX } from "@solidjs/web";
import {
  Dialog as DialogPart,
  DialogBackdrop,
  DialogClose as DialogClosePart,
  DialogContent as DialogContentPart,
  DialogDescription as DialogDescriptionPart,
  DialogTitle as DialogTitlePart,
  DialogTrigger as DialogTriggerPart,
} from "@ui-sdk/solid/dialog";
import { omit, Show, type ComponentProps } from "solid-js";

import { cn, cnState } from "../cn/index.ts";
import { withAfter } from "../internal/index.ts";

/** A modal window. Holds open state; renders no element. */
export { DialogPart as Dialog };

export type { DialogProps } from "@ui-sdk/solid/dialog";

/** UI SDK's dialog trigger props. */
export type DialogTriggerProps = ComponentProps<typeof DialogTriggerPart>;

/** Opens the dialog. Unstyled: give it `class={buttonClass()}` or render your own Button. */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  return <DialogTriggerPart {...props} />;
}

/** UI SDK's dialog close props. */
export type DialogCloseProps = ComponentProps<typeof DialogClosePart>;

/** Closes the dialog. Unstyled, like DialogTrigger. */
export function DialogClose(props: DialogCloseProps): JSX.Element {
  return <DialogClosePart {...props} />;
}

/** UI SDK's dialog content props, plus the corner close button. */
export type DialogContentProps = ComponentProps<typeof DialogContentPart> & {
  /** Adds an × button in the corner that closes the dialog. Defaults to true. */
  showClose?: boolean;
  /** Accessible name of the × button. Defaults to "Close". */
  closeLabel?: string;
};

const BACKDROP =
  "fixed inset-0 z-50 bg-overlay transition-opacity duration-150 data-ending-style:opacity-0 " +
  "data-starting-style:opacity-0 motion-reduce:transition-none";

const WINDOW = [
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4",
  "rounded-lg border bg-background p-6 text-foreground shadow-popup outline-none",
  "transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none sm:max-w-lg",
];

const CORNER_CLOSE =
  "absolute top-4 right-4 inline-flex size-6 cursor-pointer items-center justify-center rounded-sm " +
  "border-0 bg-transparent p-0 opacity-70 transition-opacity delay-0 outline-none hover:opacity-100 " +
  "focus-visible:ring-3 focus-visible:ring-ring/50";

function CornerClose(props: { label: string | undefined }): JSX.Element {
  return <DialogClosePart aria-label={props.label ?? "Close"} data-icon="x" class={CORNER_CLOSE} />;
}

/** The dialog's window, centered over a dimmed backdrop. */
export function DialogContent(props: DialogContentProps): JSX.Element {
  const rest = omit(props, "class", "children", "showClose", "closeLabel");

  return (
    <>
      <DialogBackdrop class={BACKDROP} />
      <DialogContentPart {...rest} class={cnState(WINDOW, props.class)}>
        {withAfter(
          props.children,
          <Show when={props.showClose !== false}>
            <CornerClose label={props.closeLabel} />
          </Show>,
        )}
      </DialogContentPart>
    </>
  );
}

/** Title and description, stacked. */
export function DialogHeader(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} class={cn("flex flex-col gap-2 text-center sm:text-left", props.class)} />;
}

/** Actions, right-aligned on wide screens and stacked (primary on top) on narrow ones. */
export function DialogFooter(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} class={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props.class)} />;
}

/** UI SDK's dialog title props. */
export type DialogTitleProps = ComponentProps<typeof DialogTitlePart>;

/** Names the dialog. */
export function DialogTitle(props: DialogTitleProps): JSX.Element {
  const rest = omit(props, "class");

  return <DialogTitlePart {...rest} class={cnState("text-lg leading-none font-semibold", props.class)} />;
}

/** UI SDK's dialog description props. */
export type DialogDescriptionProps = ComponentProps<typeof DialogDescriptionPart>;

/** Describes the dialog. */
export function DialogDescription(props: DialogDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return <DialogDescriptionPart {...rest} class={cnState("text-sm text-muted-foreground", props.class)} />;
}
