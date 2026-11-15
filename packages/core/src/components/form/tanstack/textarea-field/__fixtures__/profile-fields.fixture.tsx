import type { JSX } from "@solidjs/web";

import { needs, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { textareaField } from "../index.ts";

// The profile's textarea field.

function blank(value: string): boolean {
  return value === "";
}

/** Bio: a required textarea. */
export function BioField(props: ProfileFieldProps): JSX.Element {
  return (
    <textareaField.Root form={props.form} name="bio" required validators={{ onChange: needs(blank, PROFILE_ERRORS.bio) }}>
      <textareaField.Label>Bio</textareaField.Label>
      <textareaField.Control />
      <textareaField.Error />
    </textareaField.Root>
  );
}
