import type { JSX } from "@solidjs/web";
import { Checkbox, CheckboxGroup, CheckboxGroupView, CheckboxView } from "@workerstack/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@workerstack/ui/components/field";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { RequiredForm } from "./required-form.tsx";
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

function ToppingBoxes(): JSX.Element {
  return (
    <For each={TOPPINGS}>
      {(topping) => (
        <label class="flex items-center gap-2 text-sm">
          <Checkbox value={topping.value} />
          {topping.label}
        </label>
      )}
    </For>
  );
}

function Required(): JSX.Element {
  return (
    <RequiredForm>
      <Field name="agree" required>
        <FieldLabel>I agree</FieldLabel>
        <Checkbox required />
        <FieldError />
      </Field>
      <Field name="toppings" required>
        <FieldLabel>Pick a topping</FieldLabel>
        <CheckboxGroup required>
          <For each={TOPPINGS}>
            {(topping) => (
              <label class="flex items-center gap-2 text-sm">
                <Checkbox value={topping.value} />
                {topping.label}
              </label>
            )}
          </For>
        </CheckboxGroup>
        <FieldError />
      </Field>
    </RequiredForm>
  );
}

function GroupReadOnly(): JSX.Element {
  return (
    <Example align="start" label="Read-only group">
      <CheckboxGroup aria-label="Toppings" defaultValue={["ham", "olive"]} readOnly>
        <ToppingBoxes />
      </CheckboxGroup>
    </Example>
  );
}

function Views(): JSX.Element {
  return (
    <Example align="start" label="Views">
      <Field>
        <FieldLabel>Terms</FieldLabel>
        <CheckboxView value />
      </Field>
      <Field>
        <FieldLabel>Newsletter</FieldLabel>
        <CheckboxView value={false} />
      </Field>
      <CheckboxGroupView
        legend={<span class="text-sm font-medium">Toppings</span>}
        items={TOPPINGS}
        value={["ham", "olive"]}
      />
    </Example>
  );
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
      <Required />
      <GroupReadOnly />
      <Views />
    </Section>
  );
}
