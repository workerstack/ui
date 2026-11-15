import { cleanup, fireEvent, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { inputElement, type } from "../../test/dom.ts";
import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, userSteps } from "../__fixtures__/form-testing.ts";
import { COMBOBOX_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { isBlurred, renderProfile, valueOf, viewText } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";

afterEach(cleanup);

testFieldModule(COMBOBOX_CONTRACT);

function fruit(): HTMLInputElement {
  return inputElement(screen.getByRole("combobox", { name: /^Fruit/ }));
}

it("formCombobox.Control writes the picked item's value", async () => {
  const { form } = await renderProfile();
  type(fruit(), "ban");
  fireEvent.click(await screen.findByRole("option", { name: "Banana" }));
  await settle();
  expect(valueOf(form, "fruit")).toBe("banana");
  expect(fruit().value).toBe("Banana");
});

it("formCombobox.Input blurs the field when it loses focus", async () => {
  const { form } = await renderProfile();
  userSteps(
    () => fireEvent.focus(fruit()),
    () => fireEvent.blur(fruit()),
  );
  await settle();
  expect(isBlurred(form, "fruit")).toBe(true);
});

it("formCombobox.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, fruit: null } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.fruit]);
  expect(fruit().getAttribute("aria-invalid")).toBe("true");
});

it("formCombobox.Control renders the chosen label from the Root's items in a read-only form", async () => {
  const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("combobox", { name: /^Fruit/ })).toBeNull();
  expect(viewText(container, "fruit")).toBe("Banana");
});
