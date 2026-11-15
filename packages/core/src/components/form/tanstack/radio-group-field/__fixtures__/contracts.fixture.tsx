import { asContract, type FieldModuleContract } from "../../form/__fixtures__/field-module-contract.tsx";
import { radioGroupField } from "../index.ts";

// RadioGroupField's field-module contract: it shows null before a choice, which the contract can't name.

/** RadioGroupField's contract: "pro" chosen. */
export const RADIO_GROUP_CONTRACT: FieldModuleContract<string> = {
  Control: radioGroupField.Control,
  module: asContract(radioGroupField),
  shown: "pro",
  value: "pro",
};
