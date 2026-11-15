import { cleanup, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../form/__fixtures__/field-module-contract.tsx";
import { testFieldWarnings } from "../form/__fixtures__/field-warnings.ts";
import { errorTexts, settle, submit, typeInto } from "../form/__fixtures__/form-testing.ts";
import { isBlurred, renderProfile, valueOf, viewText } from "../form/__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "../form/__fixtures__/profile.fixture.ts";
import { BioField } from "./__fixtures__/profile-fields.fixture.tsx";
import { textareaField } from "./index.ts";

afterEach(cleanup);

testFieldWarnings({ field: BioField, title: "TextareaField" });

testFieldModule({ Control: textareaField.Control, module: textareaField, shown: "Ada", value: "Ada" });

function bioBox(): HTMLTextAreaElement {
  const box = screen.getByRole("textbox", { name: /^Bio/ });

  if (!(box instanceof HTMLTextAreaElement)) throw new Error("expected a <textarea>");

  return box;
}

it("TextareaField.Control writes the typed text, cleaned as the person leaves it, and blurs the field", async () => {
  const { form } = await renderProfile(BioField);
  typeInto(bioBox(), "\n  Wrote code.\nLots.  \n");
  await settle();
  expect(valueOf(form, "bio")).toBe("Wrote code.\nLots.");
  expect(isBlurred(form, "bio")).toBe(true);
});

it("TextareaField.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile(BioField, { defaults: { ...FILLED_PROFILE, bio: "" } });
  typeInto(bioBox(), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.bio]);
  expect(bioBox().getAttribute("aria-invalid")).toBe("true");
});

it("TextareaField.Control renders the text as a View in a read-only form", async () => {
  const { container } = await renderProfile(BioField, { defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("textbox", { name: /^Bio/ })).toBeNull();
  expect(viewText(container, "bio")).toBe(FILLED_PROFILE.bio);
});
