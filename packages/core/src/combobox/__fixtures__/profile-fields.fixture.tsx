import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { FRUITS, needs, PROFILE_ERRORS, TAGS, type ProfileFieldProps, type Tag } from "../../form/__fixtures__/profile.fixture.ts";
import { comboboxField, multiComboboxField } from "../field.ts";
import { ComboboxChip, ComboboxChips, ComboboxContent, ComboboxValue } from "../index.ts";

// The profile's combobox fields: one item, and several as chips, their items as data.

/** Fruit: a combobox of FRUITS, one picked. */
export function FruitField(props: ProfileFieldProps): JSX.Element {
  return (
    <comboboxField.Root
      form={props.form}
      name="fruit"
      items={FRUITS}
      validators={{ onChange: needs((value: unknown) => value === null, PROFILE_ERRORS.fruit) }}
    >
      <comboboxField.Label>Fruit</comboboxField.Label>
      <comboboxField.Control>
        <comboboxField.Input placeholder="Pick a fruit" />
        <ComboboxContent />
      </comboboxField.Control>
      <comboboxField.Error />
    </comboboxField.Root>
  );
}

function tagLabel(tag: Tag): string {
  return TAGS.find((item) => item.value === tag)?.label ?? tag;
}

/** Tags: a multiple combobox of TAGS as chips, at least one picked. */
export function TagsField(props: ProfileFieldProps): JSX.Element {
  return (
    <multiComboboxField.Root
      form={props.form}
      name="tags"
      items={TAGS}
      validators={{ onChange: needs((value: Tag[]) => value.length === 0, PROFILE_ERRORS.tags) }}
    >
      <multiComboboxField.Label>Tags</multiComboboxField.Label>
      <multiComboboxField.Control>
        <ComboboxChips>
          <ComboboxValue>
            {(state) => <For each={state.value as Tag[]}>{(tag) => <ComboboxChip value={tag}>{tagLabel(tag)}</ComboboxChip>}</For>}
          </ComboboxValue>
          <multiComboboxField.ChipsInput placeholder="Add a tag" />
        </ComboboxChips>
        <ComboboxContent />
      </multiComboboxField.Control>
      <multiComboboxField.Error />
    </multiComboboxField.Root>
  );
}
