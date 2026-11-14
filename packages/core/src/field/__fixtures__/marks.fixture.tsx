import type { JSX } from "@solidjs/web";

import { Field, FieldLabel, FieldMarksProvider, Fieldset, FieldsetDescription, FieldsetLegend } from "../index.ts";
import type { FieldMarks } from "../index.ts";

/** A required and an optional field, on plain native inputs. */
export function TwoFields(): JSX.Element {
  return (
    <>
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <input required />
      </Field>
      <Field name="nickname">
        <FieldLabel>Nickname</FieldLabel>
        <input />
      </Field>
    </>
  );
}

/** The two fields inside a form that marks as `marks` says. */
export function MarkedForm(props: { marks: FieldMarks }): JSX.Element {
  return (
    <FieldMarksProvider marks={props.marks}>
      <TwoFields />
    </FieldMarksProvider>
  );
}

/** A form that marks both kinds, with a fieldset whose legend says `required`. */
export function MarkedFieldset(props: { required?: boolean }): JSX.Element {
  return (
    <FieldMarksProvider marks="both">
      <Fieldset>
        <FieldsetLegend required={props.required}>Contact</FieldsetLegend>
        <FieldsetDescription>How we reach you.</FieldsetDescription>
        <TwoFields />
      </Fieldset>
    </FieldMarksProvider>
  );
}

/** A required field with no `required` on its control: the Field says so. */
export function FieldSaysRequired(): JSX.Element {
  return (
    <FieldMarksProvider marks="required">
      <Field required readOnly={false}>
        <FieldLabel>Plan</FieldLabel>
        <input />
      </Field>
      <Field required readOnly>
        <FieldLabel>Ref</FieldLabel>
        <input />
      </Field>
    </FieldMarksProvider>
  );
}
