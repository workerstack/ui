import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { focusPage } from "../../test/browser.ts";
import { ProfileForm, UnsavedPage } from "./__fixtures__/profile-form.fixture.tsx";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("a draft typed with the keyboard is kept and comes back on the next visit", async () => {
  await focusPage();
  const first = render(() => <ProfileForm draftKey="profile" />);
  await userEvent.click(page.getByRole("textbox", { name: "Name" }));
  await userEvent.keyboard("Ada");
  await expect.element(page.getByText(/^Saved on this device · /)).toBeVisible();
  first.unmount();
  render(() => <ProfileForm draftKey="profile" />);
  await expect.element(page.getByRole("textbox", { name: "Name" })).toHaveValue("Ada");
  await expect.element(page.getByText(/^Restored your unsaved changes from /)).toBeVisible();
});

it("the leave confirm takes focus, and Escape stays on the page", async () => {
  await focusPage();
  render(() => <UnsavedPage />);
  await userEvent.click(page.getByRole("textbox", { name: "Name" }).first());
  await userEvent.keyboard("Ada");
  await userEvent.click(page.getByRole("button", { name: "Go to settings" }));
  const dialog = page.getByRole("alertdialog");
  await expect.element(dialog).toBeVisible();
  await expect.element(dialog).toHaveAccessibleDescription("Your changes to Profile will be lost.");
  await expect.poll(() => dialog.element().contains(document.activeElement)).toBe(true);
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(page.getByTestId("answer")).toHaveTextContent("stayed");
});
