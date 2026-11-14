import type { JSX } from "@solidjs/web";

import { Field, FieldLabel } from "../../field/index.ts";
import { TextareaView } from "../index.ts";

/** A TextareaView of two lines under a Field label ("Notes"), then an empty one. */
export function NotesViews(): JSX.Element {
  return (
    <div>
      <Field>
        <FieldLabel>Notes</FieldLabel>
        <TextareaView value={"Line one\nLine two"} />
      </Field>
      <div data-testid="empty">
        <TextareaView value="" />
      </div>
    </div>
  );
}
