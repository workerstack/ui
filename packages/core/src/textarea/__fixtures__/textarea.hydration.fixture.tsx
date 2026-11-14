import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Textarea } from "../index.ts";

export function TextareaFixture() {
  const [value, setValue] = createSignal("first");

  return (
    <div>
      <Field name="notes">
        <FieldLabel>Notes</FieldLabel>
        <Textarea defaultValue="first" onValueChange={setValue} />
      </Field>
      <output>{value()}</output>
    </div>
  );
}
