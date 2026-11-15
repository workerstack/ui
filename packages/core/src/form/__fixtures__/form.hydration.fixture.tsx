import type { JSX } from "@solidjs/web";

import { AccountForm } from "./form.fixture.tsx";

/** The account form, editable, starting from a name. */
export function EditableAccount(): JSX.Element {
  return <AccountForm defaults={{ name: "Ada" }} />;
}

/** The account form read-only: Views in place of the controls. */
export function ReadOnlyAccount(): JSX.Element {
  return <AccountForm readOnly defaults={{ name: "Ada" }} />;
}
