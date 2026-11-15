import { cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, submit } from "../__fixtures__/form-testing.ts";
import { renderProfile } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";
import { testTextControl, textbox } from "./__fixtures__/text-behaviors.tsx";
import { formInputGroup } from "./form-input-group.tsx";

afterEach(cleanup);

testFieldModule({ Control: formInputGroup.Control, module: formInputGroup, shown: "ada.dev", value: "ada.dev" });

testTextControl({
  label: /^Site/,
  name: "site",
  title: "formInputGroup.Control",
  typed: " grace.dev ",
  written: "grace.dev",
});

testTextControl({
  label: /^Note/,
  name: "note",
  title: "formInputGroup.TextareaControl",
  typed: "Met at the lab.",
  written: "Met at the lab.",
});

it("formInputGroup shows its errors only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, note: "", site: "" } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.site, PROFILE_ERRORS.note]);
  expect(textbox(/^Site/).getAttribute("aria-invalid")).toBe("true");
});
