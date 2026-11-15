import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { needs, PLANS, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { radioGroupField } from "../field.ts";
import { Radio } from "../index.ts";

// The profile's radio group field.

/** Plan: a radio group under a legend, one chosen. */
export function PlanField(props: ProfileFieldProps): JSX.Element {
  return (
    <radioGroupField.Root
      form={props.form}
      name="plan"
      validators={{ onChange: needs((value: string | null) => value === null, PROFILE_ERRORS.plan) }}
    >
      <radioGroupField.Control items={PLANS} legend={<radioGroupField.Legend>Plan</radioGroupField.Legend>}>
        <For each={PLANS}>{(plan) => <Radio value={plan.value}>{plan.label}</Radio>}</For>
      </radioGroupField.Control>
      <radioGroupField.Error />
    </radioGroupField.Root>
  );
}
