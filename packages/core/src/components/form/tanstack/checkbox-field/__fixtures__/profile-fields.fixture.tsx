import type { JSX } from "@solidjs/web";

import { needs, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { checkboxField } from "../index.ts";

// The profile's checkbox field: a single checkbox.

/** Terms: a required checkbox, its label beside it. */
export function TermsField(props: ProfileFieldProps): JSX.Element {
  return (
    <checkboxField.Root form={props.form} name="terms" validators={{ onChange: needs((value: boolean) => !value, PROFILE_ERRORS.terms) }}>
      <checkboxField.Control />
      <checkboxField.Label>Terms</checkboxField.Label>
      <checkboxField.Error />
    </checkboxField.Root>
  );
}
