import type { JSX } from "@solidjs/web";

import { ProfileForm } from "./profile-form.fixture.tsx";
import { FILLED_PROFILE } from "./profile.fixture.ts";

/** The profile form, editable, every field filled but the name. */
export function EditableProfile(): JSX.Element {
  return <ProfileForm defaults={{ ...FILLED_PROFILE, name: "" }} />;
}

/** The profile form's text and choice fields, editable: no content part that writes on the server (UISDK-1). */
export function EditableProfileWithoutLists(): JSX.Element {
  return <ProfileForm withoutLists defaults={{ ...FILLED_PROFILE, name: "" }} />;
}

/** The profile form read-only: every wrapper's View. */
export function ReadOnlyProfile(): JSX.Element {
  return <ProfileForm readOnly defaults={FILLED_PROFILE} />;
}
