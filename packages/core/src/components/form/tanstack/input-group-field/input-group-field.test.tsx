import { cleanup } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../form/__fixtures__/field-module-contract.tsx";
import { testFieldWarnings } from "../form/__fixtures__/field-warnings.ts";
import { errorTexts, submit } from "../form/__fixtures__/form-testing.ts";
import { renderProfile } from "../form/__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "../form/__fixtures__/profile.fixture.ts";
import { testTextControl, textbox } from "../form/__fixtures__/text-behaviors.tsx";
import { SiteAndNoteFields } from "./__fixtures__/profile-fields.fixture.tsx";
import { inputGroupField } from "./index.ts";

afterEach(cleanup);

testFieldWarnings({ field: SiteAndNoteFields, title: "InputGroupField" });

testFieldModule({ Control: inputGroupField.Control, module: inputGroupField, shown: "ada.dev", value: "ada.dev" });

testTextControl({
  field: SiteAndNoteFields,
  label: /^Site/,
  name: "site",
  title: "InputGroupField.Control",
  typed: " grace.dev ",
  written: "grace.dev",
});

testTextControl({
  field: SiteAndNoteFields,
  label: /^Note/,
  name: "note",
  title: "InputGroupField.TextareaControl",
  typed: "Met at the lab.",
  written: "Met at the lab.",
});

it("InputGroupField shows its errors only after a submit", async () => {
  const { container } = await renderProfile(SiteAndNoteFields, { defaults: { ...FILLED_PROFILE, note: "", site: "" } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.site, PROFILE_ERRORS.note]);
  expect(textbox(/^Site/).getAttribute("aria-invalid")).toBe("true");
});
