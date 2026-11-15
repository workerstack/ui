import type { JSX } from "@solidjs/web";
import { createSignal, Show } from "solid-js";

import { cn } from "../../../../utils/cn/index.ts";
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
import { Badge } from "../../../badge/index.ts";
import { Button } from "../../../button/index.ts";
import { useUiMessages } from "../../../provider/index.ts";
import { SubmitButton } from "../form/form-parts.tsx";
import { FORM_SAVE_BAR_MESSAGES_EN } from "./form-save-bar.messages.ts";
import { useFormUnsaved } from "./form-unsaved.tsx";
import { UNSAVED_MESSAGES_EN } from "./unsaved.messages.ts";

/** What `FormSaveBar` takes. */
export type FormSaveBarProps = {
  /** Extra classes for the bar. */
  class?: string;
  /** The save button's text. @default the `saveBarSave` message */
  saveLabel?: string;
};

const BAR = [
  "sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3",
  "rounded-lg border bg-background px-4 py-2 shadow-popup",
];

/** The confirm before Discard throws every unsaved change away. */
function DiscardConfirm(props: { open: boolean; onOpenChange: (open: boolean) => void; discard: () => void }) {
  const messages = useUiMessages(FORM_SAVE_BAR_MESSAGES_EN);
  const unsaved = useUiMessages(UNSAVED_MESSAGES_EN);

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent data-slot="form-save-bar-confirm">
        <AlertDialogHeader>
          <AlertDialogTitle>{messages.saveBarDiscardTitle}</AlertDialogTitle>
          <AlertDialogDescription>{messages.saveBarDiscardDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{unsaved.unsavedStay}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" action={props.discard}>
            {messages.saveBarDiscard}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * A contextual save bar for its Form: while the form has unsaved changes, a bar pinned to the top
 * of the page area says so, with Discard (asks first, then puts the form back where it started)
 * and Save (submits). Put it first inside FormUnsaved.
 */
export function FormSaveBar(props: FormSaveBarProps): JSX.Element {
  const messages = useUiMessages(FORM_SAVE_BAR_MESSAGES_EN);
  const unsaved = useUiMessages(UNSAVED_MESSAGES_EN);
  const state = useFormUnsaved("FormSaveBar");
  // Written by the Discard button and the confirm's close.
  const [isConfirming, setConfirming] = createSignal(false, { ownedWrite: true });

  return (
    <>
      <Show when={state.changed()}>
        <section aria-label={unsaved.unsavedChanges} data-slot="form-save-bar" class={cn(BAR, props.class)}>
          <Badge variant="secondary">{unsaved.unsavedChanges}</Badge>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setConfirming(true)}>
              {messages.saveBarDiscard}
            </Button>
            <SubmitButton size="sm">{props.saveLabel ?? messages.saveBarSave}</SubmitButton>
          </div>
        </section>
      </Show>
      <DiscardConfirm open={isConfirming()} onOpenChange={setConfirming} discard={state.discard} />
    </>
  );
}
