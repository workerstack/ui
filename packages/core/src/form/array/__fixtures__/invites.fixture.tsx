import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";

import { FieldsetLegend } from "../../../field/index.ts";
import { formTextInput } from "../../controls/index.ts";
import { Form } from "../../form.tsx";
import type { FormFor } from "../../form-field.ts";
import { formArray } from "../index.ts";

// An invites form: an array of emails with a handle, the move buttons and Remove on each item, Add,
// and a rule that each email is there once, as an app writes one.

/** The invites form's values. */
export type Invites = { invites: { email: string }[] };

/** The emails the form starts with. */
export const START: Invites = { invites: [{ email: "ada@acme.dev" }, { email: "grace@acme.dev" }] };

/** The array's rule's message. */
export const UNIQUE = "Each email once.";

/** What `InvitesForm` takes. */
export type InvitesFormProps = {
  /** Remove disables at this many items. */
  min?: number;
  /** Add disables at this many items. */
  max?: number;
  /** Shows the form read-only. */
  readOnly?: boolean;
  /** Receives the form, for a test to drive it. */
  keep?: (form: FormFor<Invites>) => void;
};

/** The array's rule: no email twice. */
function unique({ value }: { value: Invites["invites"] }): string | undefined {
  return new Set(value.map((invite) => invite.email)).size < value.length ? UNIQUE : undefined;
}

/** One invite: its grip, its email and its buttons. */
function Invite(props: { form: FormFor<Invites>; index: number }): JSX.Element {
  return (
    <>
      <formArray.Handle index={props.index} />
      <formTextInput.Root form={props.form} name={`invites[${props.index}].email`}>
        <formTextInput.Label>{`Email ${props.index + 1}`}</formTextInput.Label>
        <formTextInput.Control />
      </formTextInput.Root>
      <formArray.MoveUp index={props.index} />
      <formArray.MoveDown index={props.index} />
      <formArray.Remove index={props.index} />
    </>
  );
}

/** The invites form. */
export function InvitesForm(props: InvitesFormProps = {}): JSX.Element {
  const form = createForm(() => ({ defaultValues: START }));

  props.keep?.(form);

  return (
    <Form form={form} aria-label="Invites" readOnly={props.readOnly}>
      <formArray.Root form={form} name="invites" min={props.min} max={props.max} validators={{ onChange: unique }}>
        <FieldsetLegend>Invites</FieldsetLegend>
        <formArray.Items>{(index) => <Invite form={form} index={index} />}</formArray.Items>
        <formArray.Add value={() => ({ email: "" })}>Add invite</formArray.Add>
        <formArray.Error />
      </formArray.Root>
    </Form>
  );
}
