import type { JSX } from "@solidjs/web";

import { asContract, type ContractRootProps, type FieldModuleContract } from "../../form/__fixtures__/field-module-contract.tsx";
import { FRUITS, TAGS } from "../../form/__fixtures__/profile.fixture.ts";
import { comboboxField, multiComboboxField } from "../field.ts";
import { ComboboxChips, ComboboxContent } from "../index.ts";

// The combobox fields' field-module contracts: each Root gets its items, each Control its parts.

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
