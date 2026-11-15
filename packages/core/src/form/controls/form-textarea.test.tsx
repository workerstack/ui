import { cleanup, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, typeInto } from "../__fixtures__/form-testing.ts";
import { isBlurred, renderProfile, valueOf, viewText } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";
import { formTextarea } from "./form-textarea.tsx";

afterEach(cleanup);

testFieldModule({ Control: formTextarea.Control, module: formTextarea, shown: "Ada", value: "Ada" });

function bioBox(): HTMLTextAreaElement {
  const box = screen.getByRole("textbox", { name: /^Bio/ });

  if (!(box instanceof HTMLTextAreaElement)) throw new Error("expected a <textarea>");

  return box;
}

it("formTextarea.Control writes the typed text, cleaned as the person leaves it, and blurs the field", async () => {
  const { form } = await renderProfile();
  typeInto(bioBox(), "\n  Wrote code.\nLots.  \n");
  await settle();
  expect(valueOf(form, "bio")).toBe("Wrote code.\nLots.");
  expect(isBlurred(form, "bio")).toBe(true);
});

it("formTextarea.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, bio: "" } });
  typeInto(bioBox(), "");
  await settle();
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.bio]);
  expect(bioBox().getAttribute("aria-invalid")).toBe("true");
});

it("formTextarea.Control renders the text as a View in a read-only form", async () => {
  const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("textbox", { name: /^Bio/ })).toBeNull();
  expect(viewText(container, "bio")).toBe(FILLED_PROFILE.bio);
});
