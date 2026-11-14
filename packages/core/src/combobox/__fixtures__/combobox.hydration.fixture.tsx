import { createSignal, For } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  ComboboxView,
} from "../index.ts";
import { fruits } from "./fruit-combobox.fixture.tsx";

/** Items as data, with a ComboboxContent of our own for the styles. */
export function ComboboxFixture() {
  const [value, setValue] = createSignal<string | null>("banana");

  return (
    <div>
      <Field>
        <FieldLabel>Fruit</FieldLabel>
        <Combobox items={fruits} defaultValue="banana" onValueChange={setValue}>
          <ComboboxInput placeholder="Pick a fruit" showClear />
          <ComboboxContent />
        </Combobox>
      </Field>
      <output data-testid="value">{value()}</output>
    </div>
  );
}

/** Items as children: the way UI SDK documents a Combobox. */
export function ComboboxChildrenFixture() {
  const [value, setValue] = createSignal<string | null>(null);

  return (
    <div>
      <Field>
        <FieldLabel>Fruit</FieldLabel>
        <Combobox onValueChange={setValue}>
          <ComboboxInput placeholder="Pick a fruit" />
          <ComboboxContent>
            <ComboboxEmpty />
            <ComboboxList>
              <For each={fruits}>{(fruit) => <ComboboxItem value={fruit.value} label={fruit.label}>{fruit.label}</ComboboxItem>}</For>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <output data-testid="value">{value()}</output>
    </div>
  );
}

function labelOf(value: string): string {
  return fruits.find((fruit) => fruit.value === value)?.label ?? value;
}

/** A multiple Combobox with chips. */
export function ComboboxChipsFixture() {
  const [value, setValue] = createSignal<string[]>(["apple"]);

  return (
    <div>
      <Field>
        <FieldLabel>Fruit</FieldLabel>
        <Combobox multiple items={fruits} defaultValue={["apple"]} onValueChange={setValue}>
          <ComboboxChips>
            <ComboboxValue>
              {(state) => (
                <For each={state.value as string[]}>{(fruit) => <ComboboxChip value={fruit}>{labelOf(fruit)}</ComboboxChip>}</For>
              )}
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Add a fruit" />
          </ComboboxChips>
          <ComboboxContent />
        </Combobox>
      </Field>
      <output data-testid="value">{value().join(",")}</output>
    </div>
  );
}

/** The read-only view of a multiple combobox, under a Field label. */
export function ComboboxViewFixture() {
  return (
    <Field>
      <FieldLabel>Fruit</FieldLabel>
      <ComboboxView items={fruits} value={["apple", "banana"]} />
    </Field>
  );
}
