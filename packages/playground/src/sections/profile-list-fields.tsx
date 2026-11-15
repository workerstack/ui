import type { JSX } from "@solidjs/web";
import { ComboboxChip, ComboboxChips, ComboboxContent, ComboboxValue } from "@workerstack/ui/combobox";
import { formCombobox, formMultiCombobox, formSelect, type FormFor } from "@workerstack/ui/form";
import { SelectContent, SelectValue } from "@workerstack/ui/select";
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
    <formSelect.Root form={props.form} name="role" items={profileOptions.roles} validators={validators}>
      <formSelect.Label>Role</formSelect.Label>
      <formSelect.Control placeholder="Pick a role">
        <formSelect.Trigger>
          <SelectValue />
        </formSelect.Trigger>
        <SelectContent />
      </formSelect.Control>
      <formSelect.Error />
    </formSelect.Root>
  );
}

function FruitField(props: FieldProps): JSX.Element {
  return (
    <formCombobox.Root form={props.form} name="fruit" items={profileOptions.fruits}>
      <formCombobox.Label>Fruit</formCombobox.Label>
      <formCombobox.Control>
        <formCombobox.Input placeholder="Pick a fruit" />
        <ComboboxContent />
      </formCombobox.Control>
      <formCombobox.Error />
    </formCombobox.Root>
  );
}

function TagsField(props: FieldProps): JSX.Element {
  return (
    <formMultiCombobox.Root form={props.form} name="tags" items={profileOptions.tags}>
      <formMultiCombobox.Label>Tags</formMultiCombobox.Label>
      <formMultiCombobox.Control>
        <ComboboxChips>
          <ComboboxValue>
            {(state) => (
              <For each={state.value /* a multiple combobox's value is its list of tags */ as string[]}>
                {(tag) => <ComboboxChip value={tag}>{tagLabel(tag)}</ComboboxChip>}
              </For>
            )}
          </ComboboxValue>
          <formMultiCombobox.ChipsInput placeholder="Add a tag" />
        </ComboboxChips>
        <ComboboxContent />
      </formMultiCombobox.Control>
      <formMultiCombobox.Error />
    </formMultiCombobox.Root>
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
