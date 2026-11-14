import type { JSX } from "@solidjs/web";
import { Button, buttonClass } from "@workerstack/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workerstack/ui/dialog";
import { Field, FieldLabel } from "@workerstack/ui/field";
import { Input } from "@workerstack/ui/input";
import { createSignal } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

function ShareDialog(): JSX.Element {
  const log = useLog();

  return (
    <Dialog onOpenChange={(isOpen) => log("Dialog", isOpen)}>
      <DialogTrigger class={buttonClass({ variant: "outline" })}>Share</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>Anyone with the link can view.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Link</FieldLabel>
          <Input value="https://example.com/doc/42" readonly />
        </Field>
        <DialogFooter>
          <DialogClose class={buttonClass()}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog(): JSX.Element {
  const log = useLog();

  return (
    <Dialog>
      <DialogTrigger class={buttonClass({ variant: "destructive" })}>Delete project</DialogTrigger>
      <DialogContent showClose={false}>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>This can't be undone. No corner close on this one.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose class={buttonClass({ variant: "outline" })}>Cancel</DialogClose>
          <DialogClose class={buttonClass({ variant: "destructive" })} onClick={() => log("Dialog", "deleted")}>
            Delete
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Controlled(): JSX.Element {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <Example label="Controlled">
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Open from outside
      </Button>
      <span class="self-center text-sm text-muted-foreground">open: {String(isOpen())}</span>
      <Dialog open={isOpen()} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled</DialogTitle>
            <DialogDescription>Its state lives in the page's signal.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close from a signal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Example>
  );
}

/** Uncontrolled, controlled, and without the corner close. */
export function Dialogs(): JSX.Element {
  return (
    <Section id="dialog" title="Dialog" description="Uncontrolled, controlled, and without the corner close.">
      <Example label="Uncontrolled">
        <ShareDialog />
        <DeleteDialog />
      </Example>
      <Controlled />
    </Section>
  );
}
