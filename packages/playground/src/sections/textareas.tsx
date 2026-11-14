import type { JSX } from "@solidjs/web";
import { Field, FieldDescription, FieldLabel } from "@workerstack/ui/field";
import { Textarea } from "@workerstack/ui/textarea";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { ControlStates } from "./states.tsx";

function Plain(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Grows with its text, cleaned on blur">
      <div class="w-72">
        <Field>
          <FieldLabel>Notes</FieldLabel>
          <Textarea placeholder="Write a few lines" onValueChange={(value) => log("Textarea", value)} />
          <FieldDescription>Blank lines around the text go when you leave the box.</FieldDescription>
        </Field>
      </div>
      <div class="w-72">
        <Field>
          <FieldLabel>Raw (stored as typed)</FieldLabel>
          <Textarea
            clean={false}
            defaultValue={"\n  as typed  \n"}
            onValueChange={(value) => log("Textarea raw", value)}
          />
        </Field>
      </div>
    </Example>
  );
}

function States(): JSX.Element {
  return <ControlStates control={(state) => <Textarea defaultValue="Fixed text" readonly={state === "read-only"} />} />;
}

/** A multi-line text box that grows with its text. */
export function Textareas(): JSX.Element {
  return (
    <Section id="textarea" title="Textarea" description="A multi-line text box that grows with its text.">
      <Plain />
      <States />
    </Section>
  );
}
