import { asContract, type FieldModuleContract } from "../../form/__fixtures__/field-module-contract.tsx";
import { checkboxGroupField } from "../field.ts";

// CheckboxGroupField's field-module contract: its value is a list the contract can't name.

/** CheckboxGroupField's contract: "ham" checked. */
export const CHECKBOX_GROUP_CONTRACT: FieldModuleContract<string[]> = {
  Control: checkboxGroupField.Control,
  module: asContract(checkboxGroupField),
  shown: "ham",
  value: ["ham"],
};
