import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Input } from "../../input/index.ts";
import { TextInput } from "../index.ts";

/** A TextInput in a Field named "Name", with the stored value shown beside it. */
export function NameField(): JSX.Element {
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

/** A TextInput and an Input side by side, to compare how they look. */
export function TextAndPlainInputs(): JSX.Element {
  return (
    <div>
      <TextInput aria-label="Text" />
      <Input aria-label="Plain" />
    </div>
  );
}
