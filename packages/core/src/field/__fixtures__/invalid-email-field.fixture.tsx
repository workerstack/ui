import { Input } from "../../input/index.ts";
import { Field, FieldDescription, FieldError, FieldLabel } from "../index.ts";

/** An invalid email field with every part: label, control, description and a matched error. */
export function InvalidEmailField() {
  return (
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input type="email" />
      <FieldDescription>We never share it.</FieldDescription>
      <FieldError match>That email is taken.</FieldError>
    </Field>
  );
}
