import { Checkbox, CheckboxGroup } from "../index.ts";

/** What RequiredCheckbox takes. */
export type RequiredCheckboxProps = {
  /** Starts ticked. */
  defaultChecked?: boolean;
};

/** A required checkbox in a form. */
export function RequiredCheckbox(props: RequiredCheckboxProps) {
  return (
    <form>
      <Checkbox required defaultChecked={props.defaultChecked} aria-label="Terms" />
    </form>
  );
}

/** What RequiredGroup takes. */
export type RequiredGroupProps = {
  /** The values checked at the start. */
  defaultValue?: string[];
};

/** A required group of two checkboxes in a form. */
export function RequiredGroup(props: RequiredGroupProps) {
  return (
    <form>
      <CheckboxGroup required defaultValue={props.defaultValue} aria-label="Channels">
        <Checkbox value="email" aria-label="Email" />
        <Checkbox value="sms" aria-label="SMS" />
      </CheckboxGroup>
    </form>
  );
}
