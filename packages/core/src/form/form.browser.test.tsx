import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { focusPage } from "../test/browser.ts";
import { AccountForm } from "./__fixtures__/form.fixture.tsx";

afterEach(cleanup);

// Required labels draw their mark with CSS `content`, which Chromium adds to the accessible name, so
// the boxes are found by how their names start (reported with this phase).

it("Form submitted with Enter focuses the error summary, and its link moves focus to the field", async () => {
  await focusPage();
  render(() => <AccountForm />);
  await userEvent.click(page.getByRole("textbox", { name: "Phone" }));
  await userEvent.keyboard("{Enter}");
  const summary = page.getByRole("alert").filter({ hasText: "There's a problem" });
  await expect.element(summary).toHaveFocus();
  await userEvent.click(page.getByRole("link", { name: "Email: Enter your email." }));
  await expect.element(page.getByRole("textbox", { name: /^Email/ })).toHaveFocus();
});

it("Form errors clear as the person types a fix and come back when it is undone", async () => {
  await focusPage();
  render(() => <AccountForm defaults={{ email: "ada@example.com" }} />);
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  // Vitest's locator counts the CSS required mark in the name, though Chromium does not (see
  // docs/upstream/ui-sdk.md, Other upstreams), so the box is found by the start of its name.
  const name = page.getByRole("textbox", { name: /^Name/ });
  await expect.element(name).toHaveFocus();
  await expect.element(name).toHaveAttribute("aria-invalid", "true");
  await userEvent.keyboard("A");
  await expect.element(name).not.toHaveAttribute("aria-invalid");
  await userEvent.keyboard("{Backspace}");
  await expect.element(name).toHaveAttribute("aria-invalid", "true");
  await expect.element(name).toHaveAccessibleDescription("Enter your name.");
});
