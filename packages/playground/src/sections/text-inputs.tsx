import type { JSX } from "@solidjs/web";
import { Field, FieldDescription, FieldLabel } from "@workerstack/ui/components/field";
import { TextInput, TextInputView } from "@workerstack/ui/components/text-input";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { ControlStates } from "./states.tsx";

function Plain(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Cleaned on blur">
      <div class="w-72">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <TextInput placeholder="Ada Lovelace" onValueChange={(value) => log("TextInput", value)} />
          <FieldDescription>Type spaces around a name, then leave the box.</FieldDescription>
        </Field>
      </div>
    </Example>
  );
}

function States(): JSX.Element {
  return (
    <ControlStates control={(state) => <TextInput defaultValue="ws_live_1234" readonly={state === "read-only"} />} />
  );
}

function Views(): JSX.Element {
  return (
    <Example align="start" label="View">
      <div class="w-72">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <TextInputView value="Ada Lovelace" />
        </Field>
      </div>
      <div class="w-72">
        <Field>
          <FieldLabel>Empty</FieldLabel>
          <TextInputView value={null} />
        </Field>
      </div>
    </Example>
  );
}

/** A line of plain text, cleaned when you leave the box. */
export function TextInputs(): JSX.Element {
  return (
    <Section id="text-input" title="Text input" description="A line of plain text, cleaned when you leave the box.">
      <Plain />
      <States />
      <Views />
    </Section>
  );
}
