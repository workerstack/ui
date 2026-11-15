import { omit } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Checkbox, type CheckboxProps } from "../index.ts";

/** What TermsCheckbox takes: every Checkbox prop, and whether its Field is invalid. */
export type TermsCheckboxProps = CheckboxProps & {
  /** Marks the Field invalid. */
  invalid?: boolean;
};

/** A checkbox in a Field, labelled "Accept terms". */
export function TermsCheckbox(props: TermsCheckboxProps) {
  const rest = omit(props, "invalid");

  return (
    <Field name="terms" invalid={props.invalid}>
      <FieldLabel>Accept terms</FieldLabel>
      <Checkbox {...rest} />
    </Field>
  );
}
