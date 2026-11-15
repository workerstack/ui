import type { JSX } from "@solidjs/web";
import { Checkbox } from "@workerstack/ui/checkbox";
import { checkboxField, checkboxGroupField } from "@workerstack/ui/checkbox-field";
import type { FormFor } from "@workerstack/ui/form";
import { Radio } from "@workerstack/ui/radio-group";
import { radioGroupField } from "@workerstack/ui/radio-group-field";
import { switchField } from "@workerstack/ui/switch-field";
import { For } from "solid-js";

import { profileOptions, type Profile } from "./profile-options.ts";
import { required } from "./required.ts";

type FieldProps = { form: FormFor<Profile> };

function TermsField(props: FieldProps): JSX.Element {
  return (
    <checkboxField.Root form={props.form} name="terms" validators={{ onChange: required.on("Accept the terms.") }}>
      <checkboxField.Control />
      <checkboxField.Label>Terms</checkboxField.Label>
      <checkboxField.Error />
    </checkboxField.Root>
  );
}

function AlertsField(props: FieldProps): JSX.Element {
  return (
    <switchField.Root form={props.form} name="alerts">
      <switchField.Control />
      <switchField.Label>Alerts</switchField.Label>
      <switchField.Error />
    </switchField.Root>
  );
}

function ToppingsField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.items("Pick a topping.") };

  return (
    <checkboxGroupField.Root form={props.form} name="toppings" validators={validators}>
      <checkboxGroupField.Control
        items={profileOptions.toppings}
        legend={<checkboxGroupField.Legend>Toppings</checkboxGroupField.Legend>}
      >
        <For each={profileOptions.toppings}>
          {(topping) => (
            <label>
              <Checkbox value={topping.value} />
              {topping.label}
            </label>
          )}
        </For>
      </checkboxGroupField.Control>
      <checkboxGroupField.Error />
    </checkboxGroupField.Root>
  );
}

function PlanField(props: FieldProps): JSX.Element {
  return (
    <radioGroupField.Root form={props.form} name="plan" validators={{ onChange: required.pick("Pick a plan.") }}>
      <radioGroupField.Control
        items={profileOptions.plans}
        legend={<radioGroupField.Legend>Plan</radioGroupField.Legend>}
      >
        <For each={profileOptions.plans}>{(plan) => <Radio value={plan.value}>{plan.label}</Radio>}</For>
      </radioGroupField.Control>
      <radioGroupField.Error />
    </radioGroupField.Root>
  );
}

/** The profile's choice fields: a checkbox, a switch, a checkbox group and a radio group. */
export function ProfileChoiceFields(props: FieldProps): JSX.Element {
  return (
    <>
      <TermsField form={props.form} />
      <AlertsField form={props.form} />
      <ToppingsField form={props.form} />
      <PlanField form={props.form} />
    </>
  );
}
