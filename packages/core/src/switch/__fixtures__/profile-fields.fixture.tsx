import type { JSX } from "@solidjs/web";

import { needs, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { switchField } from "../field.ts";

// The profile's switch field.

/** Alerts: a switch that must be on. */
export function AlertsField(props: ProfileFieldProps): JSX.Element {
  return (
    <switchField.Root form={props.form} name="alerts" validators={{ onChange: needs((value: boolean) => !value, PROFILE_ERRORS.alerts) }}>
      <switchField.Control />
      <switchField.Label>Alerts</switchField.Label>
      <switchField.Error />
    </switchField.Root>
  );
}
