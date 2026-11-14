import { Field, FieldLabel } from "../../field/index.ts";
import { Radio, RadioGroup, type RadioGroupProps } from "../index.ts";

/** The plans a PlanGroup offers. */
export type Plan = "free" | "pro" | "team";

/** What PlanGroup takes: the group's props, an invalid Field and a disabled Pro. */
export type PlanGroupProps = RadioGroupProps<Plan> & {
  /** Marks the Field invalid. */
  invalid?: boolean;
  /** Disables the Pro option. */
  proDisabled?: boolean;
};

/** A labelled radio group of three plans in a Field. */
export function PlanGroup(props: PlanGroupProps) {
  return (
    <Field name="plan" invalid={props.invalid}>
      <FieldLabel>Plan</FieldLabel>
      <RadioGroup
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        onValueChange={props.onValueChange}
        readOnly={props.readOnly}
      >
        <Radio value="free">Free</Radio>
        <Radio value="pro" disabled={props.proDisabled}>
          Pro
        </Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
    </Field>
  );
}
