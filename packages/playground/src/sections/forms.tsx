import type { JSX } from "@solidjs/web";

import { Section } from "../section.tsx";
import { FormArray } from "./form-array.tsx";
import { ProfileForm } from "./profile-form.tsx";
import { RecordDialogs } from "./record-dialogs.tsx";
import { UnsavedForm } from "./unsaved-form.tsx";

/** `@workerstack/ui/form`: the wrappers, the unsaved layer, and the dialog and drawer. */
export function Forms(): JSX.Element {
  return (
    <Section
      id="form"
      title="Form"
      description="TanStack forms with the UI's fields, server errors, unsaved changes, a dialog and a drawer."
    >
      <ProfileForm />
      <FormArray />
      <UnsavedForm />
      <RecordDialogs />
    </Section>
  );
}
