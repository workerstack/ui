import type { JSX } from "@solidjs/web";

import { needs, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { textInputField } from "../field.ts";

// The profile's text input field.

function blank(value: string): boolean {
  return value === "";
}

/** Name: a required text input. */
export function NameField(props: ProfileFieldProps): JSX.Element {
  return (
    <textInputField.Root form={props.form} name="name" required validators={{ onChange: needs(blank, PROFILE_ERRORS.name) }}>
      <textInputField.Label>Name</textInputField.Label>
      <textInputField.Control />
      <textInputField.Error />
    </textInputField.Root>
  );
}
