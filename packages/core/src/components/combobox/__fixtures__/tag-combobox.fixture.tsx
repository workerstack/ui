import type { ListItem } from "@ui-sdk/solid/combobox";
import { For } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  type ComboboxProps,
} from "../index.ts";

const tags: ListItem[] = [
  { label: "Bug", value: "bug" },
  { label: "Design", value: "design" },
  { label: "Feature", value: "feature" },
];

/** A multiple Combobox's onValueChange: the chosen values and what changed them. */
export type TagValueChange = NonNullable<ComboboxProps<string, true>["onValueChange"]>;

export type TagComboboxProps = {
  defaultValue?: string[];
  onValueChange?: TagValueChange;
};

function labelOf(value: string): string {
  return tags.find((tag) => tag.value === value)?.label ?? value;
}

/** A labelled multiple Combobox: one chip per chosen tag, each with a remove button. */
export function TagCombobox(props: TagComboboxProps) {
  return (
    <Field>
      <FieldLabel>Tags</FieldLabel>
      <Combobox multiple defaultValue={props.defaultValue} onValueChange={props.onValueChange} itemToLabel={labelOf}>
        <ComboboxChips>
          <ComboboxValue>
            {(state) => (
              <For each={state.value as string[]}>
                {(tag) => <ComboboxChip value={tag}>{labelOf(tag)}</ComboboxChip>}
              </For>
            )}
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Add a tag" />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            <For each={tags}>{(tag) => <ComboboxItem value={tag.value} label={tag.label}>{tag.label}</ComboboxItem>}</For>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
