import { createSignal, untrack } from "solid-js";

import { idleGuard, type CloseGuard } from "./form-close-guard.ts";
import type { FormDialogProps } from "./form-dialog-props.ts";

/** An overlay's open state and the discard question. */
export type OverlayState = {
  /** The open form's state, which its layout fills in. */
  guard: CloseGuard;
  /** Whether the window shows. */
  isOpen: () => boolean;
  /** Whether the discard question shows. */
  isAsking: () => boolean;
  /** Opens the window. */
  show: () => void;
  /** Closes the window without asking. */
  hide: () => void;
  /** Closes the window, or asks first when the form has changes; never while a save runs. */
  requestClose: () => void;
  /** Shows or hides the discard question. */
  setAsking: (asking: boolean) => void;
  /** Throws the changes away: closes the question and the window. */
  discard: () => void;
};

type OpenProps = Pick<FormDialogProps<unknown>, "defaultOpen" | "onOpenChange" | "open">;

/** Whether the window shows: controlled by `open`, else its own. */
function createOpen(props: OpenProps): Pick<OverlayState, "hide" | "isOpen" | "show"> {
  // Written from events and from a save's async steps; `defaultOpen` is read once, as a start.
  const [own, setOwn] = createSignal(untrack(() => props.defaultOpen) ?? false, { ownedWrite: true });

  function show(): void {
    if (props.open === undefined) setOwn(true);
    props.onOpenChange?.(true);
  }

  function hide(): void {
    if (props.open === undefined) setOwn(false);
    props.onOpenChange?.(false);
  }

  return { hide, isOpen: () => props.open ?? own(), show };
}

/** The open state and the discard question of a form overlay. */
export function createOverlayState(props: OpenProps): OverlayState {
  const [asking, setAsking] = createSignal(false, { ownedWrite: true });
  const open = createOpen(props);
  const guard = idleGuard();

  function requestClose(): void {
    if (guard.busy()) return;

    if (guard.changed()) setAsking(true);
    else open.hide();
  }

  function discard(): void {
    setAsking(false);
    open.hide();
  }

  return { ...open, discard, guard, isAsking: asking, requestClose, setAsking };
}
