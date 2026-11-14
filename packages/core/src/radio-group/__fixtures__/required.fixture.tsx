import { Radio, RadioGroup } from "../index.ts";

/** A required radio group in a form. */
export function RequiredRadios(props: { defaultValue?: string }) {
  return (
    <form>
      <RadioGroup required name="plan" defaultValue={props.defaultValue} aria-label="Plan">
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>
    </form>
  );
}
