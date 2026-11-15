import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { Checkbox } from "../../../checkbox/index.ts";
import { Radio } from "../../../radio-group/index.ts";
import { formCheckbox, formCheckboxGroup, formRadioGroup, formSwitch } from "../index.ts";
import { needs, PLANS, PROFILE_ERRORS, TOPPINGS, type ProfileFieldProps } from "./profile.fixture.ts";

// The profile's choice fields: a checkbox, a switch, a checkbox group and a radio group.

function unchecked(value: boolean): boolean {
  return !value;
}

/** Terms: a required checkbox, its label beside it. */
export function TermsField(props: ProfileFieldProps): JSX.Element {
  return (
    <formCheckbox.Root form={props.form} name="terms" validators={{ onChange: needs(unchecked, PROFILE_ERRORS.terms) }}>
      <formCheckbox.Control />
      <formCheckbox.Label>Terms</formCheckbox.Label>
      <formCheckbox.Error />
    </formCheckbox.Root>
  );
}

/** Alerts: a switch that must be on. */
export function AlertsField(props: ProfileFieldProps): JSX.Element {
  return (
    <formSwitch.Root form={props.form} name="alerts" validators={{ onChange: needs(unchecked, PROFILE_ERRORS.alerts) }}>
      <formSwitch.Control />
      <formSwitch.Label>Alerts</formSwitch.Label>
      <formSwitch.Error />
    </formSwitch.Root>
  );
}

/** Toppings: a checkbox group under a legend, at least one checked. */
export function ToppingsField(props: ProfileFieldProps): JSX.Element {
  return (
    <formCheckboxGroup.Root
      form={props.form}
      name="toppings"
      validators={{ onChange: needs((value: string[]) => value.length === 0, PROFILE_ERRORS.toppings) }}
    >
      <formCheckboxGroup.Control items={TOPPINGS} legend={<formCheckboxGroup.Legend>Toppings</formCheckboxGroup.Legend>}>
        <For each={TOPPINGS}>
          {(topping) => (
            <label>
              <Checkbox value={topping.value} />
              {topping.label}
            </label>
          )}
        </For>
      </formCheckboxGroup.Control>
      <formCheckboxGroup.Error />
    </formCheckboxGroup.Root>
  );
}

/** Plan: a radio group under a legend, one chosen. */
export function PlanField(props: ProfileFieldProps): JSX.Element {
  return (
    <formRadioGroup.Root
      form={props.form}
      name="plan"
      validators={{ onChange: needs((value: string | null) => value === null, PROFILE_ERRORS.plan) }}
    >
      <formRadioGroup.Control items={PLANS} legend={<formRadioGroup.Legend>Plan</formRadioGroup.Legend>}>
        <For each={PLANS}>{(plan) => <Radio value={plan.value}>{plan.label}</Radio>}</For>
      </formRadioGroup.Control>
      <formRadioGroup.Error />
    </formRadioGroup.Root>
  );
}
