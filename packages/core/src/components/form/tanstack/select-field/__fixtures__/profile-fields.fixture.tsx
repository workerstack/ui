import type { JSX } from "@solidjs/web";

import { needs, PROFILE_ERRORS, ROLES, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { selectField } from "../index.ts";
import { SelectContent, SelectValue } from "../../../../select/index.ts";

// The profile's select field, its options as data.

/** Role: a select of ROLES, one picked. */
export function RoleField(props: ProfileFieldProps): JSX.Element {
  return (
    <selectField.Root
      form={props.form}
      name="role"
      items={ROLES}
      validators={{ onChange: needs((value: unknown) => value === null, PROFILE_ERRORS.role) }}
    >
      <selectField.Label>Role</selectField.Label>
      <selectField.Control placeholder="Pick a role">
        <selectField.Trigger>
          <SelectValue />
        </selectField.Trigger>
        <SelectContent />
      </selectField.Control>
      <selectField.Error />
    </selectField.Root>
  );
}
