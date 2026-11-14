import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { TextInput } from "../index.ts";

/** A labelled TextInput with its typed value shown beside it. */
export function TextInputFixture(): JSX.Element {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <TextInput onValueChange={setValue} />
      </Field>
      <output>{`[${value()}]`}</output>
    </div>
  );
}

/** An uncontrolled TextInput, read-only and editable, with default values, inside a form. */
export function DefaultsForm(): JSX.Element {
  return (
    <form>
      <Field name="company">
        <FieldLabel>Company</FieldLabel>
        <TextInput readonly defaultValue="Analytical Engines Ltd" />
      </Field>
      <Field name="team">
        <FieldLabel>Team</FieldLabel>
        <TextInput defaultValue="Research" />
      </Field>
    </form>
  );
}
