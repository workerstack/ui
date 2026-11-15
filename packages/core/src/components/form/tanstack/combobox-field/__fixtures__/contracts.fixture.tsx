import type { JSX } from "@solidjs/web";

import { ComboboxContent } from "../../../../combobox/index.ts";
import { asContract, type ContractRootProps, type FieldModuleContract } from "../../form/__fixtures__/field-module-contract.tsx";
import { FRUITS } from "../../form/__fixtures__/profile.fixture.ts";
import { comboboxField } from "../index.ts";

// ComboboxField's field-module contract: the Root gets its items, the Control its parts.

function ComboboxControl(): JSX.Element {
  return (
    <comboboxField.Control>
      <comboboxField.Input />
      <ComboboxContent />
    </comboboxField.Control>
  );
}

/** ComboboxField's contract over FRUITS: Banana picked. */
export const COMBOBOX_CONTRACT: FieldModuleContract<string> = {
  Control: ComboboxControl,
  module: asContract({ ...comboboxField, Root: (props: ContractRootProps) => <comboboxField.Root {...props} items={FRUITS} /> }),
  shown: "Banana",
  value: "banana",
};
