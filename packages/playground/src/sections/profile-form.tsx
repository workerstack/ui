import type { JSX } from "@solidjs/web";
import { Field, FieldLabel } from "@workerstack/ui/components/field";
import {
  applyServerErrors,
  createForm,
  Form,
  SubmitButton,
  type FormFor,
} from "@workerstack/ui/components/form/tanstack/form";
import { Switch } from "@workerstack/ui/components/switch";
import { createSignal } from "solid-js";

import { useLog, type Log } from "../log.tsx";
import { SAVE_DELAY, TAKEN_NAME } from "../playground.constants.ts";
import { Example } from "../section.tsx";
import { ProfileChoiceFields } from "./profile-choice-fields.tsx";
import { ProfileListFields } from "./profile-list-fields.tsx";
import { profileOptions, type Profile } from "./profile-options.ts";
import { ProfileTextFields } from "./profile-text-fields.tsx";

function save(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SAVE_DELAY));
}

function createProfileForm(log: Log): FormFor<Profile> {
  const form = createForm(() => ({
    defaultValues: profileOptions.empty,
    onSubmit: async ({ value }: { value: Profile }) => {
      await save();

      if (value.name.toLowerCase() === TAKEN_NAME) {
        applyServerErrors(form, { name: ["That name is taken."] });

        return;
      }

      log("Profile saved", value.name);
    },
  }));

  return form;
}

/** A profile form with every control field, a fake save that refuses one name, and a read-only toggle. */
export function ProfileForm(): JSX.Element {
  const [isReadOnly, setIsReadOnly] = createSignal(false, { ownedWrite: true });
  const form = createProfileForm(useLog());

  return (
    <Example align="start" label={`Every control field (the server refuses the name "${TAKEN_NAME}")`}>
      <div class="flex w-full max-w-md flex-col gap-4">
        <Field>
          <FieldLabel>Read-only</FieldLabel>
          <Switch checked={isReadOnly()} onCheckedChange={setIsReadOnly} />
        </Field>
        <Form form={form} aria-label="Profile" readOnly={isReadOnly()}>
          <ProfileTextFields form={form} />
          <ProfileChoiceFields form={form} />
          <ProfileListFields form={form} />
          <SubmitButton>Save</SubmitButton>
        </Form>
      </div>
    </Example>
  );
}
