import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { rect, settled, style, token } from "../../test/browser.ts";
import { DimensionsPopover } from "./__fixtures__/dimensions-popover.fixture.tsx";

afterEach(cleanup);

/** The gap UI SDK leaves between the trigger and the popup, as Select and Menu leave it. */
const SIDE_OFFSET = 4;

/** What `--ui-shadow` computes to as a box shadow. */
function shadowToken(): string {
  const probe = document.createElement("div");
  probe.style.boxShadow = "var(--ui-shadow)";
  document.body.append(probe);
  const shadow = getComputedStyle(probe).boxShadow;
  probe.remove();

  return shadow;
}

function popup(): ReturnType<typeof page.getByRole> {
  return page.getByRole("dialog");
}

function trigger(): ReturnType<typeof page.getByRole> {
  return page.getByRole("button", { name: "Dimensions" });
}

function shown(): boolean {
  return popup().query()?.checkVisibility() ?? false;
}

/** Opens the popover with a real click and waits until it has settled. */
async function open(): Promise<void> {
  await userEvent.click(trigger());
  await expect.element(popup()).toBeVisible();
  await settled(popup().element());
}

it("Popover opens under its trigger at the side offset, 288px wide", async () => {
  render(() => <DimensionsPopover />);
  await open();
  const anchor = rect(trigger().element());
  const box = rect(popup().element());
  expect(box.top - anchor.bottom).toBeCloseTo(SIDE_OFFSET, 0);
  expect(box.width).toBe(288);
  expect(style(popup().element()).paddingTop).toBe("16px");
});

it("Popover paints the popup shadow and the popover colors", async () => {
  render(() => <DimensionsPopover />);
  await open();
  const popupStyle = style(popup().element());
  expect(popupStyle.boxShadow).toContain(shadowToken());
  expect(popupStyle.boxShadow).not.toBe("none");
  expect(popupStyle.backgroundColor).toBe(token("--ui-background"));
  expect(popupStyle.color).toBe(token("--ui-foreground"));
});

it("Popover moves focus inside from the keyboard", async () => {
  render(() => <DimensionsPopover />);
  trigger().element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(popup()).toBeVisible();
  await vi.waitFor(() => expect(popup().element().contains(document.activeElement)).toBe(true));
});

it("Popover closes on a click outside and on Escape", async () => {
  render(() => <DimensionsPopover />);
  await open();
  await userEvent.click(document.body, { position: { x: 5, y: 400 } });
  await vi.waitFor(() => expect(shown()).toBe(false));
  await open();
  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(shown()).toBe(false));
  expect(document.activeElement).toBe(trigger().element());
});
