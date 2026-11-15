import type { JSX } from "@solidjs/web";

import { Section } from "../section.tsx";
import { InvitesForm } from "./invites-form.tsx";
import { ProfileForm } from "./profile-form.tsx";
import { RecordDialogs } from "./record-dialogs.tsx";
import { UnsavedForm } from "./unsaved-form.tsx";

/** `@workerstack/ui/form` with the control fields: a profile, an array, the unsaved layer, the dialog and drawer. */
export function Forms(): JSX.Element {
  return (
    <Section
      id="form"
      title="Form"
      description="TanStack forms with the UI's fields, server errors, unsaved changes, a dialog and a drawer."
    >
      <ProfileForm />
      <InvitesForm />
      <UnsavedForm />
      <RecordDialogs />
    </Section>
  );
}
