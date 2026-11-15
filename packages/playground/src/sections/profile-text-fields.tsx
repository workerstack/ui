import type { JSX } from "@solidjs/web";
import { formInputGroup, formTextarea, formTextInput, type FormFor } from "@workerstack/ui/form";
import { InputGroup, InputGroupAddon, InputGroupText } from "@workerstack/ui/input";

import type { Profile } from "./profile-options.ts";
import { required } from "./required.ts";

type FieldProps = { form: FormFor<Profile> };

function NameField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.text("Enter your name.") };

  return (
    <formTextInput.Root form={props.form} name="name" required validators={validators}>
      <formTextInput.Label>Name</formTextInput.Label>
      <formTextInput.Control />
      <formTextInput.Error />
    </formTextInput.Root>
  );
}

function BioField(props: FieldProps): JSX.Element {
  return (
    <formTextarea.Root form={props.form} name="bio" required validators={{ onChange: required.text("Write a bio.") }}>
      <formTextarea.Label>Bio</formTextarea.Label>
      <formTextarea.Control />
      <formTextarea.Error />
    </formTextarea.Root>
  );
}

function SiteField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.text("Enter your site.") };

  return (
    <formInputGroup.Root form={props.form} name="site" required validators={validators}>
      <formInputGroup.Label>Site</formInputGroup.Label>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <formInputGroup.Control />
      </InputGroup>
      <formInputGroup.Error />
    </formInputGroup.Root>
  );
}

function NoteField(props: FieldProps): JSX.Element {
  return (
    <formInputGroup.Root form={props.form} name="note">
      <formInputGroup.Label>Note</formInputGroup.Label>
      <InputGroup>
        <formInputGroup.TextareaControl />
      </InputGroup>
      <formInputGroup.Error />
    </formInputGroup.Root>
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
