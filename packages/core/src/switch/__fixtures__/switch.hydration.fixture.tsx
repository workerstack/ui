import { createSignal } from "solid-js";

import { Field, FieldLabel } from "../../field/index.ts";
import { Switch, SwitchView } from "../index.ts";

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

/** The read-only view of a switch that is on, under a Field label. */
export function SwitchViewFixture() {
  return (
    <Field>
      <FieldLabel>Notifications</FieldLabel>
      <SwitchView value />
    </Field>
  );
}
