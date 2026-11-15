import { cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, typeInto } from "../__fixtures__/form-testing.ts";
import { renderProfile } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";
import { testTextControl, textbox } from "./__fixtures__/text-behaviors.tsx";
import { formTextInput } from "./form-text-input.tsx";

afterEach(cleanup);

testFieldModule({ Control: formTextInput.Control, module: formTextInput, shown: "Ada", value: "Ada" });

testTextControl({ label: /^Name/, name: "name", title: "formTextInput.Control", typed: "  Grace  ", written: "Grace" });

it("formTextInput.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, name: "" } });
  typeInto(textbox(/^Name/), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.name]);
  expect(textbox(/^Name/).getAttribute("aria-invalid")).toBe("true");
});
