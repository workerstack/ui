import type { ListItem } from "@ui-sdk/solid/combobox";
import { For } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  type ComboboxProps,
} from "../index.ts";

export const fruits: ListItem[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Orange", value: "orange" },
];

/** A single Combobox's onValueChange: the chosen value (or null) and what changed it. */
export type FruitValueChange = NonNullable<Exclude<ComboboxProps<string, false>, { multiple: true }>["onValueChange"]>;

export type FruitComboboxProps = {
  defaultValue?: string;
  onValueChange?: FruitValueChange;
  showClear?: boolean;
  showTrigger?: boolean;
};

/** A labelled single Combobox with its items as children, the way UI SDK documents it. */
export function FruitCombobox(props: FruitComboboxProps) {
  return (
    <Field>
      <FieldLabel>Fruit</FieldLabel>
      <Combobox defaultValue={props.defaultValue} onValueChange={props.onValueChange}>
        <ComboboxInput placeholder="Pick a fruit" showClear={props.showClear} showTrigger={props.showTrigger} />
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            <For each={fruits}>{(fruit) => <ComboboxItem value={fruit.value} label={fruit.label}>{fruit.label}</ComboboxItem>}</For>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

/** A labelled Combobox whose items are data, so the server can show the chosen label. */
export function FruitItemsCombobox(props: { defaultValue?: string; name?: string }) {
  return (
    <Field name={props.name}>
      <FieldLabel>Fruit</FieldLabel>
      <Combobox items={fruits} defaultValue={props.defaultValue} name={props.name}>
        <ComboboxInput placeholder="Pick a fruit" />
        <ComboboxContent />
      </Combobox>
    </Field>
  );
}
