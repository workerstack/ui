import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import type { OptionColor, OptionItem } from "../../internal/index.ts";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "../index.ts";

/** Statuses with a color, and one without. */
export const STATUSES: OptionItem<string>[] = [
  { color: "success", label: "Open", value: "open" },
  { color: "danger", label: "Blocked", value: "blocked" },
  { label: "Later", value: "later" },
];

/** What StatusCombobox takes. */
export type StatusComboboxProps = {
  /** The status chosen at the start. */
  defaultValue?: string;
  /** A value's color, over the items' own. */
  itemToColor?: (value: string) => OptionColor | undefined;
  /** Shows the value without letting it change. */
  readOnly?: boolean;
  /** An element before the text. */
  start?: JSX.Element;
};

/** A labelled Combobox of statuses (items as colored children), with every control the input can draw. */
export function StatusCombobox(props: StatusComboboxProps) {
  return (
    <Field>
      <FieldLabel>Status</FieldLabel>
      <Combobox items={STATUSES} defaultValue={props.defaultValue} itemToColor={props.itemToColor} readOnly={props.readOnly}>
        <ComboboxInput placeholder="Pick a status" showClear start={props.start} />
        <ComboboxContent>
          <ComboboxList>
            <For each={STATUSES}>
              {(item) => (
                <ComboboxItem value={item.value} label={item.label}>
                  {item.label}
                </ComboboxItem>
              )}
            </For>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
