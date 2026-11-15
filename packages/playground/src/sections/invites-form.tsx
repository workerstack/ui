import type { JSX } from "@solidjs/web";
import { FieldsetLegend } from "@workerstack/ui/field";
import { createForm, Form, formArray, SubmitButton, type FormFor } from "@workerstack/ui/form";
import { textInputField } from "@workerstack/ui/text-input-field";

import { useLog } from "../log.tsx";
import { Example } from "../section.tsx";

type Invites = { invites: { email: string }[] };

const START: Invites = { invites: [{ email: "ada@acme.dev" }, { email: "grace@acme.dev" }] };

/** The array's rule: at least one row. */
function atLeastOne({ value }: { value: Invites["invites"] }): string | undefined {
  return value.length === 0 ? "Invite at least one person." : undefined;
}

function Invite(props: { form: FormFor<Invites>; index: number }): JSX.Element {
  return (
    <div class="flex items-end gap-2">
      <formArray.Handle index={props.index} />
      <textInputField.Root form={props.form} name={`invites[${props.index}].email`}>
        <textInputField.Label>{`Email ${props.index + 1}`}</textInputField.Label>
        <textInputField.Control />
      </textInputField.Root>
      <formArray.MoveUp index={props.index} />
      <formArray.MoveDown index={props.index} />
      <formArray.Remove index={props.index} />
    </div>
  );
}

/** A list of invite emails: drag, move up and down, add and remove rows; an empty list shows an error on submit. */
export function InvitesForm(): JSX.Element {
  const log = useLog();

  const form = createForm(() => ({
    defaultValues: START,
    onSubmit: ({ value }: { value: Invites }) => log("Invites sent", ...value.invites.map((invite) => invite.email)),
  }));

  return (
    <Example align="start" label="Form array (invites, at least one)">
      <Form form={form} aria-label="Invites" class="flex w-full max-w-md flex-col gap-3">
        <formArray.Root form={form} name="invites" validators={{ onChange: atLeastOne }}>
          <FieldsetLegend>Invites</FieldsetLegend>
          <formArray.Items>{(index) => <Invite form={form} index={index} />}</formArray.Items>
          <formArray.Add value={() => ({ email: "" })}>Add invite</formArray.Add>
          <formArray.Error />
        </formArray.Root>
        <SubmitButton>Send invites</SubmitButton>
      </Form>
    </Example>
  );
}
