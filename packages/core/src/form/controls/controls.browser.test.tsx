import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { focusPage } from "../../test/browser.ts";
import { errorTexts } from "../__fixtures__/form-testing.ts";
import { ProfileForm } from "./__fixtures__/profile-form.fixture.tsx";
import { FILLED_PROFILE, PROFILE_ERRORS, type Profile } from "./__fixtures__/profile.fixture.ts";

afterEach(cleanup);

// Required labels draw their mark with CSS `content`, which Vitest's locator counts in the name
// (docs/upstream/ui-sdk.md, Other upstreams), so those boxes are found by how their names start.

async function fillText(): Promise<void> {
  await userEvent.fill(page.getByRole("textbox", { name: /^Name/ }), "Ada");
  await userEvent.fill(page.getByRole("textbox", { name: /^Bio/ }), FILLED_PROFILE.bio);
  await userEvent.fill(page.getByRole("textbox", { name: /^Site/ }), "ada.dev");
  await userEvent.fill(page.getByRole("textbox", { name: /^Note/ }), FILLED_PROFILE.note);
}

async function fillChoices(): Promise<void> {
  await userEvent.click(page.getByRole("checkbox", { name: "Terms" }));
  await userEvent.click(page.getByRole("switch", { name: "Alerts" }));
  await userEvent.click(page.getByRole("checkbox", { name: "Ham" }));
  await userEvent.click(page.getByRole("radio", { name: "Pro" }));
}

async function pick(box: string, option: string, typed?: string): Promise<void> {
  const control = page.getByRole("combobox", { name: box });

  if (typed === undefined) await userEvent.click(control);
  else await userEvent.fill(control, typed);
  await userEvent.click(page.getByRole("option", { name: option }));
}

async function fillLists(): Promise<void> {
  await pick("Role", "Admin");
  await pick("Fruit", "Banana", "ban");
  await pick("Tags", "Bug", "bu");
  await pick("Tags", "Design", "des");
}

it("form controls take a person's input: each wrapper writes its field, and Save sends them all", async () => {
  await focusPage();
  const sent = vi.fn<(values: Profile) => void>();
  render(() => <ProfileForm onSubmit={sent} />);
  await fillText();
  await fillChoices();
  await fillLists();
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  await vi.waitFor(() => expect(sent.mock.calls).toStrictEqual([[FILLED_PROFILE]]));
});

it("form controls each show their error after an empty Save, and the summary links to them", async () => {
  await focusPage();
  const { container } = render(() => <ProfileForm />);
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  const summary = page.getByRole("alert").filter({ hasText: "There's a problem" });
  await expect.element(summary).toHaveFocus();
  expect(errorTexts(container)).toStrictEqual(Object.values(PROFILE_ERRORS));
  await userEvent.click(page.getByRole("link", { name: `Role: ${PROFILE_ERRORS.role}` }));
  await expect.element(page.getByRole("combobox", { name: "Role" })).toHaveFocus();
});
