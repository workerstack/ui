import { createSignal } from "solid-js";

import { Field, FieldError, FieldLabel } from "../../field/index.ts";
import { Textarea } from "../index.ts";
import { NotesViews } from "./textarea-view.fixture.tsx";

/** A Textarea with a default value and its typed value shown beside it. */
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

/** A Textarea limited to ten characters, past the limit from the start. */
export function CounterFixture() {
  return (
    <Field name="notes">
      <FieldLabel>Notes</FieldLabel>
      <Textarea defaultValue="a long first line" maxLength={10} />
      <FieldError />
    </Field>
  );
}

/** The views, for hydration. */
export const ViewsFixture = NotesViews;
