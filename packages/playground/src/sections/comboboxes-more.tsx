import type { JSX } from "@solidjs/web";
import { Combobox, ComboboxColorDot, ComboboxContent, ComboboxInput, ComboboxView } from "@workerstack/ui/combobox";
import { Field, FieldLabel } from "@workerstack/ui/field";
import type { OptionDotProps } from "@workerstack/ui/view";

import { Example } from "../section.tsx";

type OptionColor = OptionDotProps["color"];

const STATUSES = ["backlog", "active", "blocked", "done"];

const COLORS: readonly { color: OptionColor; value: string }[] = [
  { color: "info", value: "active" },
  { color: "neutral", value: "backlog" },
  { color: "danger", value: "blocked" },
  { color: "success", value: "done" },
];

function colorOf(value: string): OptionColor | undefined {
  return COLORS.find((entry) => entry.value === value)?.color;
}

/** The start slot, colored items (`itemToColor`) and the color dot before the text. */
export function StartAndColor(): JSX.Element {
  return (
    <Example align="start" label="Start slot and item colors">
      <div class="w-64">
        <Field>
          <FieldLabel>Price</FieldLabel>
          <Combobox items={["10", "20", "50"]}>
            <ComboboxInput start="$" placeholder="Pick an amount" />
            <ComboboxContent />
          </Combobox>
        </Field>
      </div>
      <div class="w-64">
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Combobox items={STATUSES} itemToColor={colorOf} defaultValue="active">
            <ComboboxInput start={<ComboboxColorDot value="active" />} placeholder="Pick a status" />
            <ComboboxContent />
          </Combobox>
        </Field>
      </div>
    </Example>
  );
}

/** A read-only combobox, and the view that replaces it. */
export function ReadOnlyAndView(): JSX.Element {
  return (
    <Example align="start" label="Read-only and view">
      <div class="w-64">
        <Field>
          <FieldLabel>Read-only</FieldLabel>
          <Combobox items={STATUSES} itemToColor={colorOf} defaultValue="done" readOnly>
            <ComboboxInput />
            <ComboboxContent />
          </Combobox>
        </Field>
      </div>
      <div class="w-64">
        <Field>
          <FieldLabel>View</FieldLabel>
          <ComboboxView items={STATUSES} itemToColor={colorOf} value="blocked" />
        </Field>
      </div>
      <div class="w-64">
        <Field>
          <FieldLabel>Several, plain</FieldLabel>
          <ComboboxView items={STATUSES} value={["backlog", "done"]} />
        </Field>
      </div>
    </Example>
  );
}
