import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Radio, RadioGroup } from "../index.ts";

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
