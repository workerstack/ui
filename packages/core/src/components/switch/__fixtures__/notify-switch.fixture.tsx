import { Field, FieldLabel } from "../../field/index.ts";
import { Switch, type SwitchProps } from "../index.ts";

/** What the fixture takes: the Switch's props. */
export type NotifySwitchProps = SwitchProps;

/** A switch labelled "Notifications" by a Field label. */
export function NotifySwitch(props: NotifySwitchProps) {
  return (
    <Field name="notifications">
      <FieldLabel>Notifications</FieldLabel>
      <Switch {...props} />
    </Field>
  );
}
