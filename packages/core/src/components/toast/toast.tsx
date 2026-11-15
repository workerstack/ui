import type { JSX } from "@solidjs/web";
import {
  Toast as ToastPart,
  ToastAction as ToastActionPart,
  ToastClose as ToastClosePart,
  ToastDescription as ToastDescriptionPart,
  ToastRegion as ToastRegionPart,
  ToastTitle as ToastTitlePart,
  type ToastCancel,
  type ToastRegionProps as ToastRegionPartProps,
} from "@ui-sdk/solid/toast";
import { omit, Show, type ComponentProps } from "solid-js";

import { CLOSE_MESSAGES_EN } from "../../internal/close.messages.ts";
import { cn, cnState } from "../../utils/cn/index.ts";
import { buttonClass } from "../button/index.ts";
import { useUiMessages } from "../provider/index.ts";

/**
 * UI SDK's shared `toast()`: `toast("Saved")`, `toast.success(...)`, `toast.error(...)`,
 * `toast.promise(save(), { loading, success, error })`. Rendered by a `Toaster`.
 */
export { toast } from "@ui-sdk/solid/toast";

/** Creates a queue of toasts for a second `Toaster`, passed to it as `toaster`. */
export { createToaster } from "@ui-sdk/solid/toast";

export type {
  ToastActionData,
  ToastButtonState,
  ToastData,
  ToastDismissDetails,
  ToastDismissReason,
  ToastItem,
  ToastOptions,
  ToastRegionState,
  ToastState,
  ToastType,
  Toaster as ToastQueue,
} from "@ui-sdk/solid/toast";

// Position comes from the region's `data-side`; the stack reads UI SDK's `--toast-*` variables.
const REGION =
  "group/region pointer-events-none w-full max-w-sm p-4 outline-none [--sign:-1] data-[side=top]:[--sign:1] " +
  "[&>ol]:relative [&>ol]:h-(--toast-front-height,auto) data-expanded:[&>ol]:h-(--toast-stack-height,auto)";

const TOAST = [
  "pointer-events-auto absolute inset-x-0 bottom-0 flex items-center gap-3 overflow-hidden rounded-lg border",
  "bg-background p-4 text-foreground shadow-popup outline-none select-none focus-visible:ring-3",
  "focus-visible:ring-ring/50 group-data-[side=top]/region:top-0 group-data-[side=top]/region:bottom-auto",
  "z-[calc(100-var(--toast-index,0))] h-(--toast-front-height,auto) data-expanded:h-(--toast-height,auto)",
  "[--lift:calc(var(--toast-index,0)*0.75rem)]",
  "[translate:var(--toast-swipe-x,0px)_calc(var(--sign)*var(--lift)+var(--toast-swipe-y,0px))]",
  "[scale:calc(1_-_var(--toast-index,0)*0.05)] origin-bottom group-data-[side=top]/region:origin-top",
  "data-expanded:[--lift:calc(var(--toast-index,0)*0.75rem+var(--toast-offset,0px))]",
  "data-expanded:scale-100 transition-[translate,scale,opacity,height] duration-300 delay-0 starting:opacity-0",
  "data-swiping:transition-none data-[type=error]:border-destructive/50 motion-reduce:transition-none",
  "after:absolute after:-inset-y-2 after:inset-x-0 after:-z-10 after:content-['']",
  "[&:not([data-front]):not([data-expanded])>*]:opacity-0 *:transition-opacity *:duration-300",
];

const CLOSE =
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent " +
  "p-0 opacity-70 transition-opacity delay-0 outline-none hover:opacity-100 focus-visible:ring-3 " +
  "focus-visible:ring-ring/50";

/** UI SDK's toast props. */
export type ToastProps = ComponentProps<typeof ToastPart>;

/** One toast, a list item. Swipe it toward the region's edge, or press Escape on it, to dismiss it. */
export function Toast(props: ToastProps): JSX.Element {
  const rest = omit(props, "class");

  return <ToastPart {...rest} class={cnState((state) => cn(TOAST, state.leaving && "opacity-0"), props.class)} />;
}

/** UI SDK's toast title props. */
export type ToastTitleProps = ComponentProps<typeof ToastTitlePart>;

/** The toast's title: its `title`, unless given children. */
export function ToastTitle(props: ToastTitleProps): JSX.Element {
  const rest = omit(props, "class");

  return <ToastTitlePart {...rest} class={cn("text-sm font-medium", props.class)} />;
}

/** UI SDK's toast description props. */
export type ToastDescriptionProps = ComponentProps<typeof ToastDescriptionPart>;

/** The toast's description: its `description`, unless given children. */
export function ToastDescription(props: ToastDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return <ToastDescriptionPart {...rest} class={cn("text-sm text-muted-foreground", props.class)} />;
}

/** UI SDK's toast action props. */
export type ToastActionProps = ComponentProps<typeof ToastActionPart>;

/** The toast's action, like Undo, as a small outline button. */
export function ToastAction(props: ToastActionProps): JSX.Element {
  const rest = omit(props, "class");

  return <ToastActionPart {...rest} class={cnState(buttonClass({ size: "sm", variant: "outline" }), props.class)} />;
}

/** UI SDK's toast close props. */
export type ToastCloseProps = ComponentProps<typeof ToastClosePart> & {
  /** Accessible name of the × button. Defaults to the provider's `close` string ("Close" in English). */
  label?: string;
};

/** Closes the toast. Draws an × unless given children, named from the provider's `close` string. */
export function ToastClose(props: ToastCloseProps): JSX.Element {
  const messages = useUiMessages(CLOSE_MESSAGES_EN);
  const rest = omit(props, "class", "label");

  return (
    <ToastClosePart
      aria-label={props.label ?? messages.close}
      data-icon={props.children === undefined ? "x" : undefined}
      {...rest}
      class={cnState(CLOSE, props.class)}
    />
  );
}

/** UI SDK's toast region props, without the render function: a `Toaster` renders every part itself. */
export type ToasterProps = Omit<ToastRegionPartProps, "children">;

/** The toast region: a fixed stack of toasts, bottom-right unless `side` and `align` say otherwise. */
export function ToastRegion(props: ToastRegionPartProps): JSX.Element {
  const rest = omit(props, "class");

  return <ToastRegionPart {...rest} class={cnState(REGION, props.class)} />;
}

/** The close button of a toast that carries a `cancel` of its own, or the default ×. */
function Dismiss(props: { cancel: ToastCancel<JSX.Element> | undefined }): JSX.Element {
  return (
    <Show when={props.cancel} fallback={<ToastClose />}>
      {(cancel) => (
        <Show when={cancel().onCancel} fallback={<ToastClose>{cancel().label}</ToastClose>}>
          {(onCancel) => <ToastClose action={onCancel()}>{cancel().label}</ToastClose>}
        </Show>
      )}
    </Show>
  );
}

/** What an app renders once, near its root: shows the toasts of `toast()` (or of `toaster`). */
export function Toaster(props: ToasterProps): JSX.Element {
  return (
    <ToastRegion {...props}>
      {(data) => (
        <Toast>
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          <Dismiss cancel={data.cancel} />
        </Toast>
      )}
    </ToastRegion>
  );
}
