import type { JSX } from "@solidjs/web";
import { Checkbox } from "@workerstack/ui/checkbox";
import { formCheckbox, formCheckboxGroup, formRadioGroup, formSwitch, type FormFor } from "@workerstack/ui/form";
import { Radio } from "@workerstack/ui/radio-group";
import { For } from "solid-js";

import { profileOptions, type Profile } from "./profile-options.ts";
import { required } from "./required.ts";

type FieldProps = { form: FormFor<Profile> };

function TermsField(props: FieldProps): JSX.Element {
  return (
    <formCheckbox.Root form={props.form} name="terms" validators={{ onChange: required.on("Accept the terms.") }}>
      <formCheckbox.Control />
      <formCheckbox.Label>Terms</formCheckbox.Label>
      <formCheckbox.Error />
    </formCheckbox.Root>
  );
}

function AlertsField(props: FieldProps): JSX.Element {
  return (
    <formSwitch.Root form={props.form} name="alerts">
      <formSwitch.Control />
      <formSwitch.Label>Alerts</formSwitch.Label>
      <formSwitch.Error />
    </formSwitch.Root>
  );
}

function ToppingsField(props: FieldProps): JSX.Element {
  const validators = { onChange: required.items("Pick a topping.") };

  return (
    <formCheckboxGroup.Root form={props.form} name="toppings" validators={validators}>
      <formCheckboxGroup.Control
        items={profileOptions.toppings}
        legend={<formCheckboxGroup.Legend>Toppings</formCheckboxGroup.Legend>}
      >
        <For each={profileOptions.toppings}>
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

function PlanField(props: FieldProps): JSX.Element {
  return (
    <formRadioGroup.Root form={props.form} name="plan" validators={{ onChange: required.pick("Pick a plan.") }}>
      <formRadioGroup.Control items={profileOptions.plans} legend={<formRadioGroup.Legend>Plan</formRadioGroup.Legend>}>
        <For each={profileOptions.plans}>{(plan) => <Radio value={plan.value}>{plan.label}</Radio>}</For>
      </formRadioGroup.Control>
      <formRadioGroup.Error />
    </formRadioGroup.Root>
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
