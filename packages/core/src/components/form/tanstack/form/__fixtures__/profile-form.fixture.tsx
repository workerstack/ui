import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";

import { Form, SubmitButton, type FormFor } from "../index.ts";
import { EMPTY_PROFILE, type Profile, type ProfileField } from "./profile.fixture.ts";

// The profile form a control field's tests render, as an app writes one: the field under test, then
// Save. Each folder's fixtures hold its own fields; the form and its values are shared.

/** What `ProfileForm` takes. */
export type ProfileFormProps = {
  /** The field, or fields, under test. */
  field: ProfileField;
  /** The values the form starts from. */
  defaults?: Partial<Profile>;
  /** Shows the field read-only. */
  readOnly?: boolean;
  /** Called with the values a submit sends. */
  onSubmit?: (values: Profile) => void;
  /** Receives the form, for a test to drive it. */
  keep?: (form: FormFor<Profile>) => void;
};

/** The profile form: the field under test, then Save. */
export function ProfileForm(props: ProfileFormProps): JSX.Element {
  const form = createForm(() => ({
    defaultValues: { ...EMPTY_PROFILE, ...props.defaults },
    onSubmit: ({ value }: { value: Profile }) => props.onSubmit?.(value),
  }));

  props.keep?.(form);

  return (
    <Form form={form} aria-label="Profile" readOnly={props.readOnly}>
      <props.field form={form} />
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}
