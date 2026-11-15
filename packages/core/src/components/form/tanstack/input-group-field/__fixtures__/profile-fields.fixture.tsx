import type { JSX } from "@solidjs/web";

import { needs, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { inputGroupField } from "../index.ts";
import { InputGroup, InputGroupAddon, InputGroupText } from "../../../../input/index.ts";

// The profile's input group fields: a group's input and a group's textarea.

function blank(value: string): boolean {
  return value === "";
}

/** Site: a required input in a group after an `https://` addon. */
export function SiteField(props: ProfileFieldProps): JSX.Element {
  return (
    <inputGroupField.Root form={props.form} name="site" required validators={{ onChange: needs(blank, PROFILE_ERRORS.site) }}>
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

/** Note: a required textarea in a group. */
export function NoteField(props: ProfileFieldProps): JSX.Element {
  return (
    <inputGroupField.Root form={props.form} name="note" required validators={{ onChange: needs(blank, PROFILE_ERRORS.note) }}>
      <inputGroupField.Label>Note</inputGroupField.Label>
      <InputGroup>
        <inputGroupField.TextareaControl />
      </InputGroup>
      <inputGroupField.Error />
    </inputGroupField.Root>
  );
}

/** Site, then Note: both of the group's controls. */
export function SiteAndNoteFields(props: ProfileFieldProps): JSX.Element {
  return (
    <>
      <SiteField form={props.form} />
      <NoteField form={props.form} />
    </>
  );
}
