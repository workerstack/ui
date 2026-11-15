import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";

import { FormDialogBody } from "./form-dialog-body.tsx";
import type { OverlayPart } from "./form-dialog-layout.tsx";
import type { FormDrawerProps } from "./form-dialog-props.ts";
import { FormDiscard } from "./form-discard.tsx";
import { createOverlayState } from "./form-overlay-state.ts";

/** What a shell (a dialog or a drawer) takes: whether it is open, and the window's content. */
export type OverlayShellProps = {
  /** Classes for the window. */
  class: string | undefined;
  /** The edge a drawer slides from; a dialog ignores it. */
  side: FormDrawerProps<unknown>["side"] | undefined;
  /** Whether the window shows. */
  open: boolean;
  /** Hears every change of whether it shows: a close from Escape, the backdrop or the ×. */
  onOpenChange: (open: boolean) => void;
  /** The window's content. */
  children: JSX.Element;
};

/** What `FormOverlay` takes: the drawer's props, and the shell that draws the window. */
export type FormOverlayProps<TFormData> = FormDrawerProps<TFormData> & {
  /** Draws the window: a Dialog, or a Drawer. */
  shell: Component<OverlayShellProps>;
  /** The shell's title part. */
  Title: OverlayPart;
  /** The shell's description part. */
  Description: OverlayPart;
};

/**
 * Open state, the trigger and the discard question around a shell holding a form. Closing asks
 * first when the form has changes; a save that worked closes without asking, and nothing closes
 * it while a save runs.
 */
export function FormOverlay<TFormData>(props: FormOverlayProps<TFormData>): JSX.Element {
  const state = createOverlayState(props);

  return (
    <>
      {props.trigger?.(state.show)}
      <props.shell
        open={state.isOpen()}
        onOpenChange={(next) => (next ? state.show() : state.requestClose())}
        class={props.class}
        side={props.side}
      >
        <FormDialogBody {...props} guard={state.guard} finish={state.hide} requestClose={state.requestClose} />
      </props.shell>
      <FormDiscard open={state.isAsking()} onOpenChange={state.setAsking} onDiscard={state.discard} />
    </>
  );
}
