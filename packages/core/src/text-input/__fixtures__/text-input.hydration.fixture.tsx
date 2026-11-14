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
