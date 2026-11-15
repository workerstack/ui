import type { JSX } from "@solidjs/web";

import { InputGroup, InputGroupAddon, InputGroupText } from "../../../input/index.ts";
import { formInputGroup, formTextarea, formTextInput } from "../index.ts";
import { needs, PROFILE_ERRORS, type ProfileFieldProps } from "./profile.fixture.ts";

// The profile's text fields: a text input, a textarea, and an input group's input and textarea.

function blank(value: string): boolean {
  return value === "";
}

/** Name: a required text input. */
export function NameField(props: ProfileFieldProps): JSX.Element {
  return (
    <formTextInput.Root form={props.form} name="name" required validators={{ onChange: needs(blank, PROFILE_ERRORS.name) }}>
      <formTextInput.Label>Name</formTextInput.Label>
      <formTextInput.Control />
      <formTextInput.Error />
    </formTextInput.Root>
  );
}

/** Bio: a required textarea. */
export function BioField(props: ProfileFieldProps): JSX.Element {
  return (
    <formTextarea.Root form={props.form} name="bio" required validators={{ onChange: needs(blank, PROFILE_ERRORS.bio) }}>
      <formTextarea.Label>Bio</formTextarea.Label>
      <formTextarea.Control />
      <formTextarea.Error />
    </formTextarea.Root>
  );
}

/** Site: a required input in a group after an `https://` addon. */
export function SiteField(props: ProfileFieldProps): JSX.Element {
  return (
    <formInputGroup.Root form={props.form} name="site" required validators={{ onChange: needs(blank, PROFILE_ERRORS.site) }}>
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

/** Note: a required textarea in a group. */
export function NoteField(props: ProfileFieldProps): JSX.Element {
  return (
    <formInputGroup.Root form={props.form} name="note" required validators={{ onChange: needs(blank, PROFILE_ERRORS.note) }}>
      <formInputGroup.Label>Note</formInputGroup.Label>
      <InputGroup>
        <formInputGroup.TextareaControl />
      </InputGroup>
      <formInputGroup.Error />
    </formInputGroup.Root>
  );
}
