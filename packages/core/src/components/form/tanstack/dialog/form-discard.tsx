import type { JSX } from "@solidjs/web";

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

/** What `FormDiscard` takes. */
export type FormDiscardProps = {
  /** Whether the question shows. */
  open: boolean;
  /** Hears the question open and close. */
  onOpenChange: (open: boolean) => void;
  /** Called when the person chooses to throw the changes away. */
  onDiscard: () => void;
};

/** Asks whether to throw a form's changes away; keeping them goes back to the form. */
export function FormDiscard(props: FormDiscardProps): JSX.Element {
  const messages = useUiMessages();

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{messages.dialogDiscardTitle}</AlertDialogTitle>
          <AlertDialogDescription>{messages.dialogDiscardDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{messages.dialogKeepEditing}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={props.onDiscard}>
            {messages.dialogDiscard}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
