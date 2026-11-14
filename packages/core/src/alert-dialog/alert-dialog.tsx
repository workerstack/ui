import type { JSX } from "@solidjs/web";
import {
  AlertDialog as AlertDialogPart,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent as AlertDialogContentPart,
  AlertDialogDescription as AlertDialogDescriptionPart,
  AlertDialogTitle as AlertDialogTitlePart,
  AlertDialogTrigger as AlertDialogTriggerPart,
} from "@ui-sdk/solid/alert-dialog";
import { omit, type ComponentProps } from "solid-js";

import { buttonClass, type ButtonSize, type ButtonVariant } from "../button/index.ts";
import { cnState } from "../cn/index.ts";
import { modalBackdrop, modalDescription, modalTitle, modalWindow } from "../internal/index.ts";

/** A modal that interrupts and waits for an answer. Holds open state; renders no element. */
export { AlertDialogPart as AlertDialog };

export type { AlertDialogProps } from "@ui-sdk/solid/alert-dialog";

// The header and footer are plain layout, the same as the dialog's.
export { DialogFooter as AlertDialogFooter, DialogHeader as AlertDialogHeader } from "../dialog/index.ts";

/** UI SDK's alert dialog trigger props. */
export type AlertDialogTriggerProps = ComponentProps<typeof AlertDialogTriggerPart>;

/** Opens the alert dialog. Unstyled: give it `class={buttonClass()}`. */
export function AlertDialogTrigger(props: AlertDialogTriggerProps): JSX.Element {
  return <AlertDialogTriggerPart {...props} />;
}

/** UI SDK's alert dialog content props. */
export type AlertDialogContentProps = ComponentProps<typeof AlertDialogContentPart>;

/** The alert dialog's window, centered over a dimmed backdrop. It has no close button and ignores outside clicks. */
export function AlertDialogContent(props: AlertDialogContentProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <>
      <AlertDialogBackdrop class={modalBackdrop} />
      <AlertDialogContentPart {...rest} class={cnState(modalWindow, props.class)} />
    </>
  );
}

/** UI SDK's alert dialog title props. */
export type AlertDialogTitleProps = ComponentProps<typeof AlertDialogTitlePart>;

/** Names the alert dialog. */
export function AlertDialogTitle(props: AlertDialogTitleProps): JSX.Element {
  const rest = omit(props, "class");

  return <AlertDialogTitlePart {...rest} class={cnState(modalTitle, props.class)} />;
}

/** UI SDK's alert dialog description props. */
export type AlertDialogDescriptionProps = ComponentProps<typeof AlertDialogDescriptionPart>;

/** Says what the alert dialog asks. */
export function AlertDialogDescription(props: AlertDialogDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return <AlertDialogDescriptionPart {...rest} class={cnState(modalDescription, props.class)} />;
}

/** UI SDK's alert dialog close props, plus how the button looks. */
export type AlertDialogButtonProps = ComponentProps<typeof AlertDialogClose> & {
  /** Defaults to `primary` for an action and `outline` for a cancel. */
  variant?: ButtonVariant;
  /** Defaults to `md`. */
  size?: ButtonSize;
};

/** The props of `AlertDialogAction`. */
export type AlertDialogActionProps = Omit<AlertDialogButtonProps, "variant"> & {
  /** `destructive` for an action that deletes. Defaults to `primary`. */
  variant?: "primary" | "destructive";
};

/** The props of `AlertDialogCancel`. */
export type AlertDialogCancelProps = AlertDialogButtonProps;

function AlertDialogButton(props: AlertDialogButtonProps & { fallback: ButtonVariant }): JSX.Element {
  const rest = omit(props, "class", "variant", "size", "fallback");
  const look = buttonClass({ size: props.size, variant: props.variant ?? props.fallback });

  return <AlertDialogClose {...rest} class={cnState(look, props.class)} />;
}

/** The button that confirms. It closes the alert dialog after its `action` runs, like UI SDK's close. */
export function AlertDialogAction(props: AlertDialogActionProps): JSX.Element {
  return <AlertDialogButton {...props} fallback="primary" />;
}

/** The button that backs out, styled as an outline Button. */
export function AlertDialogCancel(props: AlertDialogCancelProps): JSX.Element {
  return <AlertDialogButton {...props} fallback="outline" />;
}
