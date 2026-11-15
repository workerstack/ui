import type { JSX } from "@solidjs/web";

import { ComboboxChips, ComboboxContent } from "../../../combobox/index.ts";
import { SelectContent, SelectValue } from "../../../select/index.ts";
import type { FieldModuleContract } from "../../__fixtures__/field-module-contract.tsx";
import type { FieldModule, RootProps } from "../../index.ts";
import { formCheckboxGroup, formCombobox, formMultiCombobox, formRadioGroup, formSelect } from "../index.ts";
import { FRUITS, ROLES, TAGS } from "./profile.fixture.ts";

// The shared field-module contract for the wrappers whose Root takes options or whose Control
// takes parts: each Root gets its items, each Control its parts. The contract renders a field of
// `unknown`, so each module is handed over as the contract's own type.

/** What a contract Root takes. */
type ContractRootProps = RootProps<{ answer: unknown }, "answer">;

/** A module as the contract takes it. */
function asContract<TValue>(module: object): FieldModule<TValue> {
  return module as FieldModule<TValue>;
}

/** formCheckboxGroup's contract: "ham" checked. */
export const CHECKBOX_GROUP_CONTRACT: FieldModuleContract<string[]> = {
  Control: formCheckboxGroup.Control,
  module: asContract(formCheckboxGroup),
  shown: "ham",
  value: ["ham"],
};

/** formRadioGroup's contract: "pro" chosen. */
export const RADIO_GROUP_CONTRACT: FieldModuleContract<string> = {
  Control: formRadioGroup.Control,
  module: asContract(formRadioGroup),
  shown: "pro",
  value: "pro",
};

function SelectControl(): JSX.Element {
  return (
    <formSelect.Control>
      <formSelect.Trigger>
        <SelectValue />
      </formSelect.Trigger>
      <SelectContent />
    </formSelect.Control>
  );
}

/** formSelect's contract over ROLES: Admin picked. */
export const SELECT_CONTRACT: FieldModuleContract<string> = {
  Control: SelectControl,
  module: asContract({ ...formSelect, Root: (props: ContractRootProps) => <formSelect.Root {...props} items={ROLES} /> }),
  shown: "Admin",
  value: "admin",
};

function ComboboxControl(): JSX.Element {
  return (
    <formCombobox.Control>
      <formCombobox.Input />
      <ComboboxContent />
    </formCombobox.Control>
  );
}

/** formCombobox's contract over FRUITS: Banana picked. */
export const COMBOBOX_CONTRACT: FieldModuleContract<string> = {
  Control: ComboboxControl,
  module: asContract({ ...formCombobox, Root: (props: ContractRootProps) => <formCombobox.Root {...props} items={FRUITS} /> }),
  shown: "Banana",
  value: "banana",
};

function MultiComboboxControl(): JSX.Element {
  return (
    <formMultiCombobox.Control>
      <ComboboxChips>
        <formMultiCombobox.ChipsInput />
      </ComboboxChips>
      <ComboboxContent />
    </formMultiCombobox.Control>
  );
}

/** formMultiCombobox's contract over TAGS: Bug and Design picked. */
export const MULTI_COMBOBOX_CONTRACT: FieldModuleContract<string[]> = {
  Control: MultiComboboxControl,
  module: asContract({
    ...formMultiCombobox,
    Root: (props: ContractRootProps) => <formMultiCombobox.Root {...props} items={TAGS} />,
  }),
  shown: "Bug, Design",
  value: ["bug", "design"],
};
