import type { JSX } from "@solidjs/web";

import { asContract, type ContractRootProps, type FieldModuleContract } from "../../form/__fixtures__/field-module-contract.tsx";
import { ROLES } from "../../form/__fixtures__/profile.fixture.ts";
import { selectField } from "../index.ts";
import { SelectContent, SelectValue } from "../../../../select/index.ts";

// SelectField's field-module contract: its Root gets ROLES, its Control its trigger and content.

function SelectControl(): JSX.Element {
  return (
    <selectField.Control>
      <selectField.Trigger>
        <SelectValue />
      </selectField.Trigger>
      <SelectContent />
    </selectField.Control>
  );
}

/** SelectField's contract over ROLES: Admin picked. */
export const SELECT_CONTRACT: FieldModuleContract<string> = {
  Control: SelectControl,
  module: asContract({ ...selectField, Root: (props: ContractRootProps) => <selectField.Root {...props} items={ROLES} /> }),
  shown: "Admin",
  value: "admin",
};
