import type { JSX } from "@solidjs/web";

import { ProfileForm } from "../../form/__fixtures__/profile-form.fixture.tsx";
import { FILLED_PROFILE } from "../../form/__fixtures__/profile.fixture.ts";
import { NameField } from "./profile-fields.fixture.tsx";

// The Name text input in the profile form, for TextInputField's hydration tests.

/** The field filled and editable. */
export function Editable(): JSX.Element {
  return <ProfileForm field={NameField} defaults={FILLED_PROFILE} />;
}

/** The field filled and read-only: its View. */
export function ReadOnly(): JSX.Element {
  return <ProfileForm field={NameField} readOnly defaults={FILLED_PROFILE} />;
}

/** The field editable and empty, so a submit shows its error. */
export function Blank(): JSX.Element {
  return <ProfileForm field={NameField} />;
}
