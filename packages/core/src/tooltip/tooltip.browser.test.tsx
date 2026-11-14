import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { part, rect, settled, style, token } from "../test/browser.ts";
import { SaveTooltip, type SaveTooltipProps } from "./__fixtures__/save-tooltip.fixture.tsx";

afterEach(cleanup);

/** The delay the fixtures use, short enough to keep the tests quick. */
const DELAY = 150;

function trigger(): ReturnType<typeof page.getByRole> {
  return page.getByRole("button", { name: "Save" });
}

function tooltip(): ReturnType<typeof page.getByRole> {
  return page.getByRole("tooltip");
}

/** Hovers the trigger and waits for the tooltip to settle. */
async function hovered(props: SaveTooltipProps = {}): Promise<HTMLElement> {
  render(() => <SaveTooltip delay={DELAY} {...props} />);
  await userEvent.hover(trigger());
  await expect.element(tooltip()).toBeVisible();
  const popup = tooltip().element();
  await settled(popup);

  return popup instanceof HTMLElement ? popup : document.body;
}

it("Tooltip shows after the delay on a real hover and hides when the pointer leaves", async () => {
  render(() => <SaveTooltip delay={DELAY} />);
  await userEvent.hover(trigger());
  expect(tooltip().query()?.checkVisibility() ?? false).toBe(false);
  await expect.element(tooltip()).toBeVisible();
  await userEvent.unhover(trigger());
  await vi.waitFor(() => expect(tooltip().query()?.checkVisibility() ?? false).toBe(false));
});

it("Tooltip opens above the trigger by default", async () => {
  const popup = await hovered();
  expect(rect(popup).bottom).toBeLessThanOrEqual(rect(trigger().element()).top);
});

it("Tooltip opens below the trigger with side bottom", async () => {
  const popup = await hovered({ side: "bottom" });
  expect(rect(popup).top).toBeGreaterThanOrEqual(rect(trigger().element()).bottom);
});

it("Tooltip uses the foreground and background tokens", async () => {
  const popup = await hovered();
  expect(style(popup).backgroundColor).toBe(token("--ui-foreground"));
  expect(style(popup).color).toBe(token("--ui-background"));
});

it("Tooltip draws an arrow in the tooltip's color on the edge facing the trigger", async () => {
  const popup = await hovered();
  const arrow = part(popup, "tooltip-arrow");
  expect(style(arrow).backgroundColor).toBe(token("--ui-foreground"));
  expect(rect(arrow).top).toBeGreaterThan(rect(popup).top);
  expect(rect(arrow).bottom).toBeGreaterThan(rect(popup).bottom);
});
