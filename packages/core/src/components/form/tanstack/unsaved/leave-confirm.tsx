import type { JSX } from "@solidjs/web";
import { createSignal, untrack } from "solid-js";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../alert-dialog/index.ts";
import { useUiMessages } from "../../../provider/index.ts";
import { LEAVE_CONFIRM_MESSAGES_EN } from "./leave-confirm.messages.ts";
import { UNSAVED_MESSAGES_EN } from "./unsaved.messages.ts";

/** The leave confirm's state: which forms it names, and the answers it waits for. */
export type LeaveAsk = {
  /** The forms it last asked about (kept while the dialog animates out). */
  names: () => readonly string[];
  /** Whether the dialog is open. */
  isOpen: () => boolean;
  /** Opens the dialog naming `names`; resolves `true` on Leave, `false` on Stay or a close. */
  ask: (names: readonly string[]) => Promise<boolean>;
  /** Answers Leave. */
  leave: () => void;
  /** Answers Stay. */
  stay: () => void;
};

/** The state of a leave confirm: each `ask` waits for the next answer. */
export function createLeaveAsk(): LeaveAsk {
  // Written from a router's navigation and from the dialog's buttons.
  const [names, setNames] = createSignal<readonly string[]>([], { ownedWrite: true });
  const [isOpen, setOpen] = createSignal(false, { ownedWrite: true });
  const waiting: ((isLeaving: boolean) => void)[] = [];

  function answer(choice: "leave" | "stay"): void {
    setOpen(false);

    for (const resolve of waiting.splice(0)) resolve(choice === "leave");
  }

  return {
    ask: (asked) => {
      setNames(asked);
      setOpen(true);

      return new Promise((resolve) => waiting.push(resolve));
    },
    isOpen,
    leave: () => answer("leave"),
    names,
    stay: () => answer("stay"),
  };
}

/** The dialog that asks before unsaved changes are lost: Stay keeps the page, Leave goes on. */
export function LeaveConfirm(props: { ask: LeaveAsk }): JSX.Element {
  const messages = useUiMessages(LEAVE_CONFIRM_MESSAGES_EN);
  const unsaved = useUiMessages(UNSAVED_MESSAGES_EN);

  return (
    <AlertDialog
      open={props.ask.isOpen()}
      onOpenChange={(isOpen) => {
        // Escape or a close answers Stay; Leave has answered already.
        if (!isOpen && untrack(props.ask.isOpen)) props.ask.stay();
      }}
    >
      <AlertDialogContent data-slot="unsaved-leave-confirm">
        <AlertDialogHeader>
          <AlertDialogTitle>{messages.unsavedLeaveTitle}</AlertDialogTitle>
          <AlertDialogDescription>{messages.unsavedLeaveDescription(props.ask.names())}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{unsaved.unsavedStay}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" action={props.ask.leave}>
            {messages.unsavedLeave}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
