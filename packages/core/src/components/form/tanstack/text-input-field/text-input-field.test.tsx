import { cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../form/__fixtures__/field-module-contract.tsx";
import { testFieldWarnings } from "../form/__fixtures__/field-warnings.ts";
import { errorTexts, settle, submit, typeInto } from "../form/__fixtures__/form-testing.ts";
import { renderProfile } from "../form/__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "../form/__fixtures__/profile.fixture.ts";
import { testTextControl, textbox } from "../form/__fixtures__/text-behaviors.tsx";
import { NameField } from "./__fixtures__/profile-fields.fixture.tsx";
import { textInputField } from "./index.ts";

afterEach(cleanup);

// Fixing the field after the empty submit drops its error and its summary row.
testFieldWarnings({ field: NameField, fix: () => typeInto(textbox(/^Name/), "Ada"), title: "TextInputField" });

testFieldModule({ Control: textInputField.Control, module: textInputField, shown: "Ada", value: "Ada" });

testTextControl({
  field: NameField,
  label: /^Name/,
  name: "name",
  title: "TextInputField.Control",
  typed: "  Grace  ",
  written: "Grace",
});

it("TextInputField.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile(NameField, { defaults: { ...FILLED_PROFILE, name: "" } });
  typeInto(textbox(/^Name/), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.name]);
  expect(textbox(/^Name/).getAttribute("aria-invalid")).toBe("true");
});
