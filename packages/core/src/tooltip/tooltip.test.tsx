import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { focusPage } from "../test/browser.ts";
import { mounted } from "../test/dom.ts";
import { SaveTooltip } from "./__fixtures__/save-tooltip.fixture.tsx";

afterEach(cleanup);

/** Tabs onto the trigger from inside the page. */
async function tabToTrigger(): Promise<HTMLElement> {
  render(() => <SaveTooltip delay={0} />);
  await mounted();
  await focusPage();
  await userEvent.tab();

  return screen.getByRole("button", { name: "Save" });
}

it("Tooltip shows on focus of the trigger and points the trigger at it", async () => {
  const trigger = await tabToTrigger();
  const tip = await screen.findByRole("tooltip");
  expect(tip.textContent).toContain("Save your changes");
  expect(trigger.getAttribute("aria-describedby")).toContain(tip.id);
});

it("Tooltip hides on Escape", async () => {
  await tabToTrigger();
  await screen.findByRole("tooltip");
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
});
