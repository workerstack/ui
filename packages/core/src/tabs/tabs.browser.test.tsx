import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { NO_RING, style, token } from "../test/browser.ts";
import { ProjectTabs } from "./__fixtures__/project-tabs.fixture.tsx";

afterEach(cleanup);

const TRANSPARENT = "rgba(0, 0, 0, 0)";

function tab(name: string): ReturnType<typeof page.getByRole> {
  return page.getByRole("tab", { name });
}

/** The underline a line tab draws in its `::after`. */
function underline(name: string): CSSStyleDeclaration {
  return getComputedStyle(tab(name).element(), "::after");
}

function active(): Element {
  return document.activeElement ?? document.body;
}

it("Tabs is driven by the real keyboard: one tab stop, arrows, Home and End", async () => {
  render(() => <ProjectTabs />);
  await userEvent.tab();
  expect(active()).toBe(tab("Overview").element());
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "true");
  expect(active()).toBe(tab("Billing").element());
  await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Billing content");
  await userEvent.keyboard("{End}");
  await expect.element(tab("Settings")).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{Home}");
  await expect.element(tab("Overview")).toHaveAttribute("aria-selected", "true");
  // The next stop is the panel, not another tab; then the button after the tabs.
  await userEvent.tab();
  expect(active()).toBe(page.getByRole("tabpanel").element());
  await userEvent.tab();
  expect(active()).toBe(page.getByRole("button", { name: "After" }).element());
});

it("Tabs selects with a real click", async () => {
  render(() => <ProjectTabs />);
  await userEvent.click(tab("Settings"));
  await expect.element(tab("Settings")).toHaveAttribute("aria-selected", "true");
  await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Settings content");
});

it("Tabs with manual activation selects on Enter with a real keyboard", async () => {
  render(() => <ProjectTabs activation="manual" />);
  await userEvent.tab();
  await userEvent.keyboard("{ArrowRight}");
  expect(active()).toBe(tab("Billing").element());
  await expect.element(tab("Overview")).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{Enter}");
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "true");
});

it("Tabs fills the active tab with the background and no other tab", async () => {
  render(() => <ProjectTabs defaultValue="billing" />);
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "true");
  expect(style(tab("Billing").element()).backgroundColor).toBe(token("--ui-background"));
  expect(style(tab("Billing").element()).boxShadow).not.toMatch(NO_RING);
  expect(style(tab("Overview").element()).backgroundColor).toBe(TRANSPARENT);
  expect(style(tab("Overview").element()).boxShadow).toMatch(NO_RING);
  expect(style(page.getByRole("tablist").element()).backgroundColor).toBe(token("--ui-muted"));
  await userEvent.click(tab("Settings"));
  await vi.waitFor(() => expect(style(tab("Overview").element()).backgroundColor).toBe(TRANSPARENT));
  await vi.waitFor(() => expect(style(tab("Settings").element()).backgroundColor).toBe(token("--ui-background")));
  expect(style(tab("Billing").element()).backgroundColor).toBe(TRANSPARENT);
});

it("Tabs shows a focus ring on the keyboard-focused tab only", async () => {
  render(() => <ProjectTabs activation="manual" />);
  expect(style(tab("Billing").element()).boxShadow).toMatch(NO_RING);
  await userEvent.tab();
  await userEvent.keyboard("{ArrowRight}");
  expect(active()).toBe(tab("Billing").element());
  await vi.waitFor(() => expect(style(tab("Billing").element()).boxShadow).not.toMatch(NO_RING));
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "false");
  expect(style(tab("Settings").element()).boxShadow).toMatch(NO_RING);
});

it("Tabs dims a disabled tab", () => {
  render(() => <ProjectTabs />);
  expect(style(tab("Archive").element()).opacity).toBe("0.5");
  expect(style(tab("Archive").element()).pointerEvents).toBe("none");
  expect(style(tab("Billing").element()).opacity).toBe("1");
});

it("Tabs line variant draws an underline under the active tab only", async () => {
  render(() => <ProjectTabs variant="line" defaultValue="billing" />);
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "true");
  const line = underline("Billing");
  expect(line.opacity).toBe("1");
  expect(line.height).toBe("2px");
  expect(line.backgroundColor).toBe(token("--ui-foreground"));
  expect(line.position).toBe("absolute");
  expect(underline("Overview").opacity).toBe("0");
  expect(style(tab("Billing").element()).backgroundColor).toBe(TRANSPARENT);
  expect(style(page.getByRole("tablist").element()).backgroundColor).toBe(TRANSPARENT);
});

it("Tabs line variant moves the underline to the newly selected tab", async () => {
  render(() => <ProjectTabs variant="line" />);
  await userEvent.click(tab("Settings"));
  await vi.waitFor(() => expect(underline("Settings").opacity).toBe("1"));
  await vi.waitFor(() => expect(underline("Overview").opacity).toBe("0"));
});

it("Tabs vertical orientation stacks the tabs and uses the up and down arrows", async () => {
  render(() => <ProjectTabs orientation="vertical" />);
  const overview = tab("Overview").element().getBoundingClientRect();
  const billing = tab("Billing").element().getBoundingClientRect();
  expect(billing.top).toBeGreaterThanOrEqual(overview.bottom);
  expect(billing.left).toBe(overview.left);
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "true");
});

it("Tabs in right-to-left text lay out from the right and reverse the arrows", async () => {
  render(() => <ProjectTabs dir="rtl" />);
  const overview = tab("Overview").element().getBoundingClientRect();
  const billing = tab("Billing").element().getBoundingClientRect();
  expect(billing.right).toBeLessThanOrEqual(overview.left + 1);
  await userEvent.tab();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(tab("Billing")).toHaveAttribute("aria-selected", "true");
});
