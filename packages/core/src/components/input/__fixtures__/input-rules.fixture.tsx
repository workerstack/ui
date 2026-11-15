import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { Field, FieldError, FieldLabel } from "../../field/index.ts";
import { TextInput } from "../../text-input/index.ts";
import { Input, type InputProps } from "../index.ts";

/** A required Input of spaces in a form; submitting shows the Field's error. */
export function RequiredBlankForm(): JSX.Element {
  return (
    <form>
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <Input defaultValue="   " required />
        <FieldError />
      </Field>
      <button type="submit">Save</button>
    </form>
  );
}

/** An Input limited to two characters, in a Field with its error. */
export function LimitedInput(props: { onValueChange?: InputProps["onValueChange"] }): JSX.Element {
  return (
    <Field name="code">
      <FieldLabel>Code</FieldLabel>
      <Input maxLength={2} onValueChange={props.onValueChange} />
    </Field>
  );
}

/** A read-only Input with a placeholder and a value. */
export function ReadOnlyInput(props: { value: string }): JSX.Element {
  return <Input aria-label="Plan" placeholder="Pick a plan" readonly defaultValue={props.value} />;
}

/** A TextInput with its cleaning turned off, and the value it holds shown beside it. */
export function UncleanedInput(): JSX.Element {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <TextInput aria-label="Raw" clean={false} onValueChange={setValue} />
      <output>{`[${value()}]`}</output>
    </div>
  );
}
