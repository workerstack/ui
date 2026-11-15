import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { focusPage } from "../../test/browser.ts";
import { ProfileDialog } from "./__fixtures__/form-dialog.fixture.tsx";

afterEach(cleanup);

it("FormDialog asks before Escape closes a changed form, and Discard closes it", async () => {
  await focusPage();
  render(() => <ProfileDialog />);
  await userEvent.click(page.getByRole("button", { name: "Edit" }));
  const name = page.getByRole("textbox", { name: "Name" });
  await userEvent.fill(name, "Grace");
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByText("Discard changes?")).toBeVisible();
  await userEvent.click(page.getByRole("button", { name: "Discard" }));
  await expect.element(page.getByRole("textbox", { name: "Name" })).not.toBeInTheDocument();
});

it("FormDialog submits with Enter and closes", async () => {
  await focusPage();
  render(() => <ProfileDialog />);
  await userEvent.click(page.getByRole("button", { name: "Edit" }));
  await userEvent.click(page.getByRole("textbox", { name: "Name" }));
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("textbox", { name: "Name" })).not.toBeInTheDocument();
});
