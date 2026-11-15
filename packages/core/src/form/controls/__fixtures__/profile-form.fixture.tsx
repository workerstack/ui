import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";
import { Show } from "solid-js";

import { Form, SubmitButton, type FormFor } from "../../index.ts";
import { AlertsField, PlanField, TermsField, ToppingsField } from "./choice-fields.fixture.tsx";
import { FruitField, RoleField, TagsField } from "./list-fields.fixture.tsx";
import { EMPTY_PROFILE, type Profile } from "./profile.fixture.ts";
import { BioField, NameField, NoteField, SiteField } from "./text-fields.fixture.tsx";

// A profile form of one field per wrapper, as an app writes one.

/** What `ProfileForm` takes. */
export type ProfileFormProps = {
  /** The values the form starts from. */
  defaults?: Partial<Profile>;
  /** Shows every field read-only. */
  readOnly?: boolean;
  /** Leaves out the select and comboboxes (their content parts warn on the server, UISDK-1). */
  withoutLists?: boolean;
  /** Called with the values a submit sends. */
  onSubmit?: (values: Profile) => void;
  /** Receives the form, for a test to drive it. */
  keep?: (form: FormFor<Profile>) => void;
};

/** The profile form: every wrapper's field, then Save. */
export function ProfileForm(props: ProfileFormProps = {}): JSX.Element {
  const form = createForm(() => ({
    defaultValues: { ...EMPTY_PROFILE, ...props.defaults },
    onSubmit: ({ value }: { value: Profile }) => props.onSubmit?.(value),
  }));

  props.keep?.(form);

  return (
    <Form form={form} aria-label="Profile" readOnly={props.readOnly}>
      <NameField form={form} />
      <BioField form={form} />
      <SiteField form={form} />
      <NoteField form={form} />
      <TermsField form={form} />
      <AlertsField form={form} />
      <ToppingsField form={form} />
      <PlanField form={form} />
      <Show when={props.withoutLists !== true}>
        <RoleField form={form} />
        <FruitField form={form} />
        <TagsField form={form} />
      </Show>
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}
