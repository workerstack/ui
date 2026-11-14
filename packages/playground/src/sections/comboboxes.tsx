import type { JSX } from "@solidjs/web";
import type { ListItem } from "@ui-sdk/solid/combobox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@workerstack/ui/combobox";
import { Field, FieldError, FieldLabel } from "@workerstack/ui/field";
import { createSignal, For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

const FRUITS: ListItem[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Orange", value: "orange" },
];

function labelOf(value: string): string {
  return FRUITS.find((fruit) => fruit.value === value)?.label ?? value;
}

function Single(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Items as data, with clear">
      <div class="w-64">
        <Field>
          <FieldLabel>Fruit</FieldLabel>
          <Combobox items={FRUITS} defaultValue="banana" onValueChange={(value) => log("Combobox", String(value))}>
            <ComboboxInput placeholder="Pick a fruit" showClear />
            <ComboboxContent />
          </Combobox>
        </Field>
      </div>
    </Example>
  );
}

function States(): JSX.Element {
  return (
    <Example align="start" label="Disabled, invalid">
      <div class="w-64">
        <Field disabled>
          <FieldLabel>Disabled</FieldLabel>
          <Combobox items={FRUITS} defaultValue="apple">
            <ComboboxInput />
            <ComboboxContent />
          </Combobox>
        </Field>
      </div>
      <div class="w-64">
        <Field invalid>
          <FieldLabel>Invalid</FieldLabel>
          <Combobox items={FRUITS}>
            <ComboboxInput placeholder="Pick a fruit" />
            <ComboboxContent />
          </Combobox>
          <FieldError>Pick a fruit.</FieldError>
        </Field>
      </div>
    </Example>
  );
}

function Multiple(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Multiple, with chips">
      <div class="w-72">
        <Field>
          <FieldLabel>Fruits</FieldLabel>
          <Combobox
            multiple
            items={FRUITS}
            defaultValue={["apple"]}
            onValueChange={(value) => log("Combobox multiple", value.join(", "))}
          >
            <ComboboxChips>
              <ComboboxValue>
                {(state) => (
                  <For each={state.value /* a multiple combobox holds a list */ as string[]}>
                    {(fruit) => <ComboboxChip value={fruit}>{labelOf(fruit)}</ComboboxChip>}
                  </For>
                )}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Add a fruit" />
            </ComboboxChips>
            <ComboboxContent />
          </Combobox>
        </Field>
      </div>
    </Example>
  );
}

function createLabels() {
  const log = useLog();
  const [labels, setLabels] = createSignal(["Bug", "Design", "Feature"]);

  function create(label: string): string {
    setLabels((all) => [...all, label]);
    log("Combobox create", label);

    return label;
  }

  return { create, labels };
}

function Create(): JSX.Element {
  const log = useLog();
  const { create, labels } = createLabels();

  return (
    <Example align="start" label="Create from the typed text">
      <div class="w-64">
        <Field>
          <FieldLabel>Label</FieldLabel>
          <Combobox onValueChange={(value) => log("Combobox label", String(value))}>
            <ComboboxInput placeholder="Pick or create a label" />
            <ComboboxContent>
              <ComboboxEmpty />
              <ComboboxList>
                <For each={labels()}>
                  {(label) => (
                    <ComboboxItem value={label} label={label}>
                      {label}
                    </ComboboxItem>
                  )}
                </For>
                <ComboboxCreate onCreate={create} />
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
      </div>
    </Example>
  );
}

/** Search a list as you type: single, multiple with chips, and create. */
export function Comboboxes(): JSX.Element {
  return (
    <Section
      id="combobox"
      title="Combobox"
      description="Search a list as you type: single, multiple with chips, and create."
    >
      <Single />
      <States />
      <Multiple />
      <Create />
    </Section>
  );
}
