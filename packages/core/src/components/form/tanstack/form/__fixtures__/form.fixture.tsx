import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";

import { Form, FormError, SubmitButton, type FormFor } from "../index.ts";
import { formText } from "./form-text.fixture.tsx";

// An account form of three text fields (name and email required, phone not) over the test-only
// FormText module, as an app writes one.

/** The account form's values. */
export type Account = { name: string; email: string; phone: string };

/** What a field's change validator reads. */
type ChangeInput = { value: string };

/** A change validator that asks for a value. */
export function requiredText(message: string): (input: ChangeInput) => string | undefined {
  return ({ value }) => (value === "" ? message : undefined);
}

/** What `AccountForm` takes. */
export type AccountFormProps = {
  /** Called with the values a submit sends. */
  onSubmit?: (values: Account) => void | Promise<void>;
  /** Shows every field read-only. */
  readOnly?: boolean;
  /** The values the form starts from. */
  defaults?: Partial<Account>;
  /** Receives the form, for a test to drive it. */
  keep?: (form: FormFor<Account>) => void;
  /** Rendered inside the Form, after the fields. */
  children?: JSX.Element;
};

/** One of the account's text fields: its label, control and error. */
function AccountField(props: { form: FormFor<Account>; name: keyof Account; label: string; message?: string }) {
  const message = props.message;

  return (
    <formText.Root
      form={props.form}
      name={props.name}
      required={message !== undefined}
      validators={message === undefined ? {} : { onChange: requiredText(message) }}
    >
      <formText.Label>{props.label}</formText.Label>
      <formText.Control />
      <formText.Error />
    </formText.Root>
  );
}

/** The account form: Name and Email required, Phone optional, a form alert and Save. */
export function AccountForm(props: AccountFormProps = {}): JSX.Element {
  const form = createForm(() => ({
    defaultValues: { email: "", name: "", phone: "", ...props.defaults },
    onSubmit: async ({ value }: { value: Account }) => props.onSubmit?.(value),
  }));

  props.keep?.(form);

  return (
    <Form form={form} aria-label="Account" readOnly={props.readOnly}>
      <FormError />
      <AccountField form={form} name="name" label="Name" message="Enter your name." />
      <AccountField form={form} name="email" label="Email" message="Enter your email." />
      <AccountField form={form} name="phone" label="Phone" />
      {props.children}
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}
