import type { JSX } from "@solidjs/web";
import { ComboboxChip, ComboboxChips, ComboboxContent, ComboboxValue } from "@workerstack/ui/combobox";
import { comboboxField, multiComboboxField } from "@workerstack/ui/combobox-field";
import type { FormFor } from "@workerstack/ui/form";
import { SelectContent, SelectValue } from "@workerstack/ui/select";
import { selectField } from "@workerstack/ui/select-field";
import { For } from "solid-js";

import { profileOptions, type Profile } from "./profile-options.ts";
import { required } from "./required.ts";

type FieldProps = { form: FormFor<Profile> };

function tagLabel(tag: string): string {
  return profileOptions.tags.find((item) => item.value === tag)?.label ?? tag;
}

function RoleField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.pick("Pick a role.") };

  return (
    <selectField.Root form={props.form} name="role" items={profileOptions.roles} validators={validators}>
      <selectField.Label>Role</selectField.Label>
      <selectField.Control placeholder="Pick a role">
        <selectField.Trigger>
          <SelectValue />
        </selectField.Trigger>
        <SelectContent />
      </selectField.Control>
      <selectField.Error />
    </selectField.Root>
  );
}

function FruitField(props: FieldProps): JSX.Element {
  return (
    <comboboxField.Root form={props.form} name="fruit" items={profileOptions.fruits}>
      <comboboxField.Label>Fruit</comboboxField.Label>
      <comboboxField.Control>
        <comboboxField.Input placeholder="Pick a fruit" />
        <ComboboxContent />
      </comboboxField.Control>
      <comboboxField.Error />
    </comboboxField.Root>
  );
}

function TagsField(props: FieldProps): JSX.Element {
  return (
    <multiComboboxField.Root form={props.form} name="tags" items={profileOptions.tags}>
      <multiComboboxField.Label>Tags</multiComboboxField.Label>
      <multiComboboxField.Control>
        <ComboboxChips>
          <ComboboxValue>
            {(state) => (
              <For each={state.value /* a multiple combobox's value is its list of tags */ as string[]}>
                {(tag) => <ComboboxChip value={tag}>{tagLabel(tag)}</ComboboxChip>}
              </For>
            )}
          </ComboboxValue>
          <multiComboboxField.ChipsInput placeholder="Add a tag" />
        </ComboboxChips>
        <ComboboxContent />
      </multiComboboxField.Control>
      <multiComboboxField.Error />
    </multiComboboxField.Root>
  );
}

/** The profile's list fields: a select, a combobox and a multiple combobox, their options as data. */
export function ProfileListFields(props: FieldProps): JSX.Element {
  return (
    <>
      <RoleField form={props.form} />
      <FruitField form={props.form} />
      <TagsField form={props.form} />
    </>
  );
}
