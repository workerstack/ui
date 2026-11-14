import { createSignal } from "solid-js";

import { Field, FieldLabel, FieldsetLegend } from "../../field/index.ts";
import { Checkbox, CheckboxGroupView, CheckboxView } from "../index.ts";

/** An unchecked checkbox in a Field, with an output that shows its state. */
export function CheckboxFixture() {
  const [checked, setChecked] = createSignal<boolean | "indeterminate">(false);

  return (
    <div>
      <Field name="terms">
        <FieldLabel>Accept terms</FieldLabel>
        <Checkbox onCheckedChange={setChecked} />
      </Field>
      <output>{String(checked())}</output>
    </div>
  );
}

/** A checkbox that starts checked. */
export function CheckedCheckboxFixture() {
  return (
    <Field name="terms">
      <FieldLabel>Accept terms</FieldLabel>
      <Checkbox defaultChecked />
    </Field>
  );
}

/** The read-only views of a checkbox and of a checkbox group under a legend. */
export function CheckboxViewFixture() {
  return (
    <div>
      <Field>
        <FieldLabel>Accepted</FieldLabel>
        <CheckboxView value />
      </Field>
      <CheckboxGroupView items={["Email", "SMS"]} value={["SMS", "Email"]} legend={<FieldsetLegend>Notify by</FieldsetLegend>} />
    </div>
  );
}
