import type { JSX } from "@solidjs/web";

import { createRequiredText } from "../../internal/index.ts";
import { useUiMessages } from "../../provider/index.ts";
import { Field, FieldError, FieldLabel } from "../index.ts";

/** A required native text box in a Field: its rules speak the UI's words. */
export function RequiredBox(props: { defaultValue?: string }): JSX.Element {
  const messages = useUiMessages();
  const rules = createRequiredText({ required: true }, messages);

  return (
    <Field name="name">
      <FieldLabel>Name</FieldLabel>
      <input defaultValue={props.defaultValue} onInput={rules.sync} ref={rules.ref} required />
      <FieldError />
    </Field>
  );
}

/** A required native select, and a required box of spaces, each with an error, in one form. */
export function RequiredForm(): JSX.Element {
  return (
    <form>
      <Field name="plan">
        <FieldLabel>Plan</FieldLabel>
        <select required>
          <option value="">Pick one</option>
          <option value="pro">Pro</option>
        </select>
        <FieldError />
      </Field>
      <RequiredBox defaultValue="  " />
      <button type="submit">Save</button>
    </form>
  );
}
