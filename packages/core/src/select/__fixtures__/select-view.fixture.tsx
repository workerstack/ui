import type { JSX } from "@solidjs/web";

import { Field, FieldLabel } from "../../field/index.ts";
import { SelectView } from "../index.ts";

/** The roles' labels, as a Select's `items`. */
export const ROLE_ITEMS: { value: string; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

/** A SelectView under a Field's label, naming the chosen role by its label. */
export function SelectViewFixture(): JSX.Element {
  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <SelectView items={ROLE_ITEMS} value="member" />
    </Field>
  );
}
