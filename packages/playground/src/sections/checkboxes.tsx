import type { JSX } from "@solidjs/web";
import { Checkbox, CheckboxGroup } from "@workerstack/ui/checkbox";
import { Field, FieldLabel } from "@workerstack/ui/field";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { ControlStates } from "./states.tsx";

const TOPPINGS = [
  { label: "Cheese", value: "cheese" },
  { label: "Ham", value: "ham" },
  { label: "Olive", value: "olive" },
];

function Single(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Single">
      <Field name="terms">
        <FieldLabel>Accept terms</FieldLabel>
        <Checkbox onCheckedChange={(isChecked) => log("Checkbox", String(isChecked))} />
      </Field>
      <Field name="newsletter">
        <FieldLabel>Checked by default</FieldLabel>
        <Checkbox defaultChecked />
      </Field>
    </Example>
  );
}

function States(): JSX.Element {
  return <ControlStates control={(state) => <Checkbox defaultChecked readOnly={state === "read-only"} />} />;
}

function Toppings(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Group with select all">
      <CheckboxGroup
        aria-label="Toppings"
        defaultValue={["ham"]}
        allValues={TOPPINGS.map((topping) => topping.value)}
        onValueChange={(value) => log("CheckboxGroup", value.join(", "))}
      >
        <label class="flex items-center gap-2 text-sm">
          <Checkbox parent />
          All
        </label>
        <For each={TOPPINGS}>
          {(topping) => (
            <label class="flex items-center gap-2 text-sm">
              <Checkbox value={topping.value} />
              {topping.label}
            </label>
          )}
        </For>
      </CheckboxGroup>
    </Example>
  );
}

/** Single, states, and a group with a select-all parent. */
export function Checkboxes(): JSX.Element {
  return (
    <Section
      id="checkbox"
      title="Checkbox"
      description="Single, disabled, invalid and read-only, and a group with a select-all parent."
    >
      <Single />
      <States />
      <Toppings />
    </Section>
  );
}
