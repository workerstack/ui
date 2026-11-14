import type { JSX } from "@solidjs/web";

import { Input } from "../../input/index.ts";
import { Field, FieldGroup, FieldLabel, FieldLabelGroup, Fieldset, FieldsetDescription, FieldsetLegend } from "../index.ts";

/** A shipping address: a legend, a description and two fields. */
export function AddressFieldset(props: { disabled?: boolean }): JSX.Element {
  return (
    <Fieldset disabled={props.disabled}>
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <FieldsetDescription>Where we send the order.</FieldsetDescription>
      <FieldGroup>
        <Field name="street">
          <FieldLabel>Street</FieldLabel>
          <Input />
        </Field>
        <Field name="city">
          <FieldLabel>City</FieldLabel>
          <Input />
        </Field>
      </FieldGroup>
    </Fieldset>
  );
}

/** A label-sized legend over a group of two checkboxes. */
export function ChoiceFieldset(): JSX.Element {
  return (
    <Fieldset>
      <FieldsetLegend variant="label">Contact by</FieldsetLegend>
      <label>
        <input type="checkbox" /> Email
      </label>
    </Fieldset>
  );
}

/** A field with a label group, in each orientation. */
export function Oriented(props: { orientation: "vertical" | "horizontal" | "responsive" }): JSX.Element {
  return (
    <Field orientation={props.orientation}>
      <FieldLabelGroup>
        <FieldLabel>Email</FieldLabel>
        <a href="#help">Help</a>
      </FieldLabelGroup>
      <Input />
    </Field>
  );
}
