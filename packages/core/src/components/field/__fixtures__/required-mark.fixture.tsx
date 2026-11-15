import type { JSX } from "@solidjs/web";

import { Field, FieldLabel, FieldMarksProvider, useRequiredMark } from "../index.ts";

/** A control that hides its `required` from the browser and tells the Field through the hook. */
function HiddenRequired(props: { required: boolean }): JSX.Element {
  useRequiredMark(() => props.required);

  return <span role="group" aria-label="Pick" />;
}

/** A Field whose control reports `required` only through `useRequiredMark`. */
export function HookField(props: { required: boolean }): JSX.Element {
  return (
    <FieldMarksProvider marks="required">
      <Field>
        <FieldLabel>Pick</FieldLabel>
        <HiddenRequired required={props.required} />
      </Field>
    </FieldMarksProvider>
  );
}
