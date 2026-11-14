import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Checkbox } from "../index.ts";

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
