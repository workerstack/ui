import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

import { testFieldModule, type FieldModuleContract } from "./field-module-contract.tsx";
import { testFieldWarnings, type WarningsCase } from "./field-warnings.ts";

// What a control field's dom tests use, from one module: the checks every field's file registers
// first, the form's test helpers, and the profile form's renderer, readers and values.

export { errorTexts, settle, submit, userSteps } from "./form-testing.ts";
export { isBlurred, renderProfile, valueOf, viewText } from "./profile-testing.tsx";
export { EMPTY_PROFILE, FILLED_PROFILE, PROFILE_ERRORS } from "./profile.fixture.ts";

/** Registers what every control field's dom tests start with: cleanup, the warning checks, then the module contract. */
export function testControlField<TValue>(warnings: WarningsCase, contract: FieldModuleContract<TValue>): void {
  afterEach(cleanup);
  testFieldWarnings(warnings);
  testFieldModule(contract);
}
