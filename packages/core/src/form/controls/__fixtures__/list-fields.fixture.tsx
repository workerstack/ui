import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { ComboboxChip, ComboboxChips, ComboboxContent, ComboboxValue } from "../../../combobox/index.ts";
import { SelectContent, SelectValue } from "../../../select/index.ts";
import { formCombobox, formMultiCombobox, formSelect } from "../index.ts";
import { FRUITS, needs, PROFILE_ERRORS, ROLES, TAGS, type ProfileFieldProps, type Tag } from "./profile.fixture.ts";

// The profile's list fields: a select, a combobox and a multiple combobox, their options as data.

function unset(value: unknown): boolean {
  return value === null;
}

/** Role: a select of ROLES, one picked. */
export function RoleField(props: ProfileFieldProps): JSX.Element {
  return (
    <formSelect.Root form={props.form} name="role" items={ROLES} validators={{ onChange: needs(unset, PROFILE_ERRORS.role) }}>
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

/** Fruit: a combobox of FRUITS, one picked. */
export function FruitField(props: ProfileFieldProps): JSX.Element {
  return (
    <formCombobox.Root form={props.form} name="fruit" items={FRUITS} validators={{ onChange: needs(unset, PROFILE_ERRORS.fruit) }}>
      <formCombobox.Label>Fruit</formCombobox.Label>
      <formCombobox.Control>
        <formCombobox.Input placeholder="Pick a fruit" />
        <ComboboxContent />
      </formCombobox.Control>
      <formCombobox.Error />
    </formCombobox.Root>
  );
}

function tagLabel(tag: Tag): string {
  return TAGS.find((item) => item.value === tag)?.label ?? tag;
}

/** Tags: a multiple combobox of TAGS as chips, at least one picked. */
export function TagsField(props: ProfileFieldProps): JSX.Element {
  return (
    <formMultiCombobox.Root
      form={props.form}
      name="tags"
      items={TAGS}
      validators={{ onChange: needs((value: Tag[]) => value.length === 0, PROFILE_ERRORS.tags) }}
    >
      <formMultiCombobox.Label>Tags</formMultiCombobox.Label>
      <formMultiCombobox.Control>
        <ComboboxChips>
          <ComboboxValue>
            {(state) => <For each={state.value as Tag[]}>{(tag) => <ComboboxChip value={tag}>{tagLabel(tag)}</ComboboxChip>}</For>}
          </ComboboxValue>
          <formMultiCombobox.ChipsInput placeholder="Add a tag" />
        </ComboboxChips>
        <ComboboxContent />
      </formMultiCombobox.Control>
      <formMultiCombobox.Error />
    </formMultiCombobox.Root>
  );
}
