import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { Field, FieldDescription, FieldError, FieldLabel } from "../index.ts";

/** A field whose error a button shows and hides, under a description. */
export function MotionField(): JSX.Element {
  const [invalid, setInvalid] = createSignal(false);

  return (
    <div>
      <Field invalid={invalid()}>
        <FieldLabel>Email</FieldLabel>
        <input />
        <FieldDescription>We never share it.</FieldDescription>
        <FieldError>That email is taken.</FieldError>
      </Field>
      <button type="button" onClick={() => setInvalid(!invalid())}>
        Toggle
      </button>
    </div>
  );
}
