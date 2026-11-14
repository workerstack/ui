import type { JSX } from "@solidjs/web";

import { Field, FieldLabel } from "../../field/index.ts";
import { TextInputView } from "../index.ts";

/** A TextInputView under a Field label ("Name"), then an empty one and one given null. */
export function NameViews(): JSX.Element {
  return (
    <div>
      <Field>
        <FieldLabel>Name</FieldLabel>
        <TextInputView value="Ada Lovelace" />
      </Field>
      <div data-testid="empty">
        <TextInputView value="" />
      </div>
      <div data-testid="null">
        <TextInputView value={null} />
      </div>
    </div>
  );
}
