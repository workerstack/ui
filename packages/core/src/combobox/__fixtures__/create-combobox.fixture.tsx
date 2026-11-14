import { createSignal, For } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import {
  Combobox,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  type ComboboxCreateProps,
  type ComboboxProps,
} from "../index.ts";

const INITIAL_LABELS = ["Bug", "Design", "Feature"];

export type CreateComboboxProps = {
  /** Called with the typed text; what it returns is selected, as ComboboxCreate's `onCreate` does. */
  onCreate?: ComboboxCreateProps["onCreate"];
  onValueChange?: NonNullable<Exclude<ComboboxProps<string, false>, { multiple: true }>["onValueChange"]>;
  minLength?: number;
};

/** A labelled Combobox that creates a label from the typed text and selects it. */
export function CreateCombobox(props: CreateComboboxProps) {
  const [labels, setLabels] = createSignal(INITIAL_LABELS);

  return (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <Combobox onValueChange={props.onValueChange}>
        <ComboboxInput placeholder="Pick or create a label" />
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            <For each={labels()}>{(label) => <ComboboxItem value={label} label={label}>{label}</ComboboxItem>}</For>
            <ComboboxCreate
              minLength={props.minLength}
              onCreate={(label) => {
                setLabels((all) => [...all, label]);

                return props.onCreate ? props.onCreate(label) : label;
              }}
            />
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
