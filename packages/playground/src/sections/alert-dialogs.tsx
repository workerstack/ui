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
  AlertDialogTrigger,
} from "@workerstack/ui/alert-dialog";
import { buttonClass } from "@workerstack/ui/button";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

/** A modal that waits for an answer. Outside clicks don't close it. */
export function AlertDialogs(): JSX.Element {
  const log = useLog();

  return (
    <Section id="alert-dialog" title="Alert dialog" description="A modal that waits for an answer.">
      <Example label="Destructive">
        <AlertDialog onOpenChange={(isOpen) => log("AlertDialog", isOpen)}>
          <AlertDialogTrigger class={buttonClass({ variant: "destructive" })}>Delete account</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>This can't be undone. Your files go too.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction variant="destructive" action={() => log("AlertDialog", "deleted")}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Example>
    </Section>
  );
}
