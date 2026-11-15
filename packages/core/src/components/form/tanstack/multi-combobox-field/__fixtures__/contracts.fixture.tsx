import type { JSX } from "@solidjs/web";

import { ComboboxChips, ComboboxContent } from "../../../../combobox/index.ts";
import { asContract, type ContractRootProps, type FieldModuleContract } from "../../form/__fixtures__/field-module-contract.tsx";
import { TAGS } from "../../form/__fixtures__/profile.fixture.ts";
import { multiComboboxField } from "../index.ts";

// MultiComboboxField's field-module contract: the Root gets its items, the Control its chips input.

function MultiComboboxControl(): JSX.Element {
  return (
    <multiComboboxField.Control>
      <ComboboxChips>
        <multiComboboxField.ChipsInput />
      </ComboboxChips>
      <ComboboxContent />
    </multiComboboxField.Control>
  );
}

/** MultiComboboxField's contract over TAGS: Bug and Design picked. */
export const MULTI_COMBOBOX_CONTRACT: FieldModuleContract<string[]> = {
  Control: MultiComboboxControl,
  module: asContract({
    ...multiComboboxField,
    Root: (props: ContractRootProps) => <multiComboboxField.Root {...props} items={TAGS} />,
  }),
  shown: "Bug, Design",
  value: ["bug", "design"],
};
