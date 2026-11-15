import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { needs, PROFILE_ERRORS, TOPPINGS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { checkboxField, checkboxGroupField } from "../field.ts";
import { Checkbox } from "../index.ts";

// The profile's checkbox fields: a single checkbox and a checkbox group.

/** Terms: a required checkbox, its label beside it. */
export function TermsField(props: ProfileFieldProps): JSX.Element {
  return (
    <checkboxField.Root form={props.form} name="terms" validators={{ onChange: needs((value: boolean) => !value, PROFILE_ERRORS.terms) }}>
      <checkboxField.Control />
      <checkboxField.Label>Terms</checkboxField.Label>
      <checkboxField.Error />
    </checkboxField.Root>
  );
}

/** Toppings: a checkbox group under a legend, at least one checked. */
export function ToppingsField(props: ProfileFieldProps): JSX.Element {
  return (
    <checkboxGroupField.Root
      form={props.form}
      name="toppings"
      validators={{ onChange: needs((value: string[]) => value.length === 0, PROFILE_ERRORS.toppings) }}
    >
      <checkboxGroupField.Control items={TOPPINGS} legend={<checkboxGroupField.Legend>Toppings</checkboxGroupField.Legend>}>
        <For each={TOPPINGS}>
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
