import { createSignal } from "solid-js";

import { Field, FieldLabel, FieldsetLegend } from "../../field/index.ts";
import { Radio, RadioGroup, RadioGroupView } from "../index.ts";
import { PLAN_ITEMS } from "./plans.fixture.ts";

/** A labelled group with Pro chosen, and an output that shows the chosen plan. */
export function RadioGroupFixture() {
  const [plan, setPlan] = createSignal("pro");

  return (
    <div>
      <Field name="plan">
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup defaultValue="pro" onValueChange={setPlan}>
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
      </Field>
      <output>{plan()}</output>
    </div>
  );
}

/** The read-only view of a chosen plan, under a legend. */
export function RadioGroupViewFixture() {
  return <RadioGroupView items={PLAN_ITEMS} value="business" legend={<FieldsetLegend>Plan</FieldsetLegend>} />;
}
