import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { Checkbox } from "../../../../checkbox/index.ts";
import { needs, PROFILE_ERRORS, TOPPINGS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { checkboxGroupField } from "../index.ts";

// The profile's checkbox group field: checkboxes under a legend.

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
