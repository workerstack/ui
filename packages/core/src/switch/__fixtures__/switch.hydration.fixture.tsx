import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Switch } from "../index.ts";

/** A labelled switch that reports its state in an output. */
export function SwitchFixture() {
  const [checked, setChecked] = createSignal(true);

  return (
    <div>
      <Field>
        <FieldLabel>Notifications</FieldLabel>
        <Switch defaultChecked onCheckedChange={setChecked} />
      </Field>
      <output>{checked() ? "on" : "off"}</output>
    </div>
  );
}
