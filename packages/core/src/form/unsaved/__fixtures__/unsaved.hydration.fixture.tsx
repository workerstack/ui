import type { JSX } from "@solidjs/web";

import { ProfileForm, UnsavedPage } from "./profile-form.fixture.tsx";

/** Two forms under the provider, the second keeping a draft. */
export function UnsavedFormsPage(): JSX.Element {
  return <UnsavedPage scope="u1" billingDraftKey="billing" />;
}

/** A form with its save bar, keeping a draft. */
export function SaveBarProfile(): JSX.Element {
  return <ProfileForm saveBar draftKey="profile" defaults={{ name: "Ada" }} />;
}
