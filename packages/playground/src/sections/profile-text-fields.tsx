import type { JSX } from "@solidjs/web";
import type { FormFor } from "@workerstack/ui/components/form/tanstack/form";
import { inputGroupField } from "@workerstack/ui/components/form/tanstack/input-group-field";
import { textInputField } from "@workerstack/ui/components/form/tanstack/text-input-field";
import { textareaField } from "@workerstack/ui/components/form/tanstack/textarea-field";
import { InputGroup, InputGroupAddon, InputGroupText } from "@workerstack/ui/components/input";

import type { Profile } from "./profile-options.ts";
import { required } from "./required.ts";

type FieldProps = { form: FormFor<Profile> };

function NameField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.text("Enter your name.") };

  return (
    <textInputField.Root form={props.form} name="name" required validators={validators}>
      <textInputField.Label>Name</textInputField.Label>
      <textInputField.Control />
      <textInputField.Error />
    </textInputField.Root>
  );
}

function BioField(props: FieldProps): JSX.Element {
  return (
    <textareaField.Root form={props.form} name="bio" required validators={{ onChange: required.text("Write a bio.") }}>
      <textareaField.Label>Bio</textareaField.Label>
      <textareaField.Control />
      <textareaField.Error />
    </textareaField.Root>
  );
}

function SiteField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.text("Enter your site.") };

  return (
    <inputGroupField.Root form={props.form} name="site" required validators={validators}>
      <inputGroupField.Label>Site</inputGroupField.Label>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <inputGroupField.Control />
      </InputGroup>
      <inputGroupField.Error />
    </inputGroupField.Root>
  );
}

function NoteField(props: FieldProps): JSX.Element {
  return (
    <inputGroupField.Root form={props.form} name="note">
      <inputGroupField.Label>Note</inputGroupField.Label>
      <InputGroup>
        <inputGroupField.TextareaControl />
      </InputGroup>
      <inputGroupField.Error />
    </inputGroupField.Root>
  );
}

/** The profile's text fields: a text input, a textarea, and an input group around an input and a textarea. */
export function ProfileTextFields(props: FieldProps): JSX.Element {
  return (
    <>
      <NameField form={props.form} />
      <BioField form={props.form} />
      <SiteField form={props.form} />
      <NoteField form={props.form} />
    </>
  );
}
