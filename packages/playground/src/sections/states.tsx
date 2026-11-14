import type { JSX } from "@solidjs/web";
import { Field, FieldError, FieldLabel } from "@workerstack/ui/field";

import { Example } from "../section.tsx";

/** The three states a form control shows beside its default. */
export type ControlState = "disabled" | "invalid" | "read-only";

/** A Field per state, each holding the control `control` makes for it. */
export function ControlStates(props: { control: (state: ControlState) => JSX.Element }): JSX.Element {
  return (
    <Example align="start" label="Disabled, invalid, read-only">
      <div class="w-72">
        <Field disabled>
          <FieldLabel>Disabled</FieldLabel>
          {props.control("disabled")}
        </Field>
      </div>
      <div class="w-72">
        <Field invalid>
          <FieldLabel>Invalid</FieldLabel>
          {props.control("invalid")}
          <FieldError>Something is wrong.</FieldError>
        </Field>
      </div>
      <div class="w-72">
        <Field>
          <FieldLabel>Read-only</FieldLabel>
          {props.control("read-only")}
        </Field>
      </div>
    </Example>
  );
}
