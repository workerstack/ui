import { Field, FieldLabel } from "../../field/index.ts";
import { Textarea, type TextareaProps } from "../index.ts";

/** A textarea named by a Field label ("Notes"), passing its props to the textarea. */
export function NotesTextarea(props: TextareaProps) {
  return (
    <Field name="notes">
      <FieldLabel>Notes</FieldLabel>
      <Textarea {...props} />
    </Field>
  );
}

/** The same, in a field that is invalid. */
export function InvalidNotesTextarea(props: TextareaProps) {
  return (
    <Field invalid name="notes">
      <FieldLabel>Notes</FieldLabel>
      <Textarea {...props} />
    </Field>
  );
}
