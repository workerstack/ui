import { Field, FieldError, FieldLabel } from "../../field/index.ts";
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

/** A Textarea limited to ten characters, in a Field with an error that shows the limit's message. */
export function LimitedNotes(props: TextareaProps) {
  return (
    <Field name="notes">
      <FieldLabel>Notes</FieldLabel>
      <Textarea maxLength={10} {...props} />
      <FieldError />
    </Field>
  );
}

/** A required Textarea in a Field with an error. */
export function RequiredNotes(props: TextareaProps) {
  return (
    <Field name="notes">
      <FieldLabel>Notes</FieldLabel>
      <Textarea required {...props} />
      <FieldError />
    </Field>
  );
}
