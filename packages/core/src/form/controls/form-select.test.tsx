import { cleanup, fireEvent, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { testFieldModule } from "../__fixtures__/field-module-contract.tsx";
import { errorTexts, settle, submit, userSteps } from "../__fixtures__/form-testing.ts";
import { SELECT_CONTRACT } from "./__fixtures__/contracts.fixture.tsx";
import { isBlurred, renderProfile, valueOf, viewText } from "./__fixtures__/profile-testing.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS } from "./__fixtures__/profile.fixture.ts";

afterEach(cleanup);

testFieldModule(SELECT_CONTRACT);

function trigger(): HTMLElement {
  return screen.getByRole("combobox", { name: /^Role/ });
}

it("formSelect.Control writes the picked value and shows its label", async () => {
  const { form } = await renderProfile();
  fireEvent.click(trigger());
  fireEvent.click(await screen.findByRole("option", { name: "Editor" }));
  await settle();
  expect(valueOf(form, "role")).toBe("editor");
  await vi.waitFor(() => expect(trigger().textContent).toContain("Editor"));
});

it("formSelect.Trigger blurs the field when it loses focus", async () => {
  const { form } = await renderProfile();
  userSteps(
    () => fireEvent.focus(trigger()),
    () => fireEvent.blur(trigger()),
  );
  await settle();
  expect(isBlurred(form, "role")).toBe(true);
});

it("formSelect.Control shows its error only after a submit", async () => {
  const { container } = await renderProfile({ defaults: { ...FILLED_PROFILE, role: null } });
  expect(errorTexts(container)).toStrictEqual([]);
  await submit(container);
  expect(errorTexts(container)).toStrictEqual([PROFILE_ERRORS.role]);
  expect(trigger().getAttribute("aria-invalid")).toBe("true");
});

it("formSelect.Control renders the chosen label from the Root's items in a read-only form", async () => {
  const { container } = await renderProfile({ defaults: FILLED_PROFILE, readOnly: true });
  expect(screen.queryByRole("combobox", { name: /^Role/ })).toBeNull();
  expect(viewText(container, "role")).toBe("Admin");
});
