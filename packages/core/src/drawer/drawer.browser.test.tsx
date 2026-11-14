import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { part, rect, settled, style, token } from "../test/browser.ts";
import { ShareDrawer, type ShareDrawerProps } from "./__fixtures__/share-drawer.fixture.tsx";

afterEach(cleanup);

function drawer(): ReturnType<typeof page.getByRole> {
  return page.getByRole("dialog");
}

function trigger(): ReturnType<typeof page.getByRole> {
  return page.getByRole("button", { name: "Share" });
}

/** Waits until the drawer has closed. */
async function closed(): Promise<void> {
  await expect.element(drawer()).not.toBeInTheDocument();
}

/** Renders the drawer, opens it with a real click and waits until it has settled. */
async function open(props: ShareDrawerProps = {}): Promise<void> {
  render(() => <ShareDrawer {...props} />);
  await userEvent.click(trigger());
  await expect.element(drawer()).toBeVisible();
  await settled(document.body);
}

it("Drawer sits flush at the viewport's bottom, full width, over a backdrop", async () => {
  await open();
  const box = rect(drawer().element());
  expect(box.bottom).toBeCloseTo(innerHeight, 0);
  expect(box).toMatchObject({ left: 0, width: innerWidth });
  expect(style(drawer().element()).backgroundColor).toBe(token("--ui-background"));
  const backdrop = part(document.body, "drawer-backdrop");
  expect(rect(backdrop)).toMatchObject({ height: innerHeight, left: 0, top: 0, width: innerWidth });
  expect(style(backdrop).backgroundColor).toBe(token("--ui-overlay"));
});

it("Drawer rounds only the top corners of a bottom sheet and draws the grab bar", async () => {
  await open();
  const sheet = style(drawer().element());
  expect(sheet.borderTopLeftRadius).not.toBe("0px");
  expect(sheet.borderBottomLeftRadius).toBe("0px");
  const bar = part(document.body, "drawer-grab-bar");
  expect(rect(bar)).toMatchObject({ height: 6, width: 96 });
  expect(style(bar).backgroundColor).toBe(token("--ui-muted"));
});

it("Drawer on the right sits at the right edge, full height", async () => {
  await open({ side: "right" });
  const box = rect(drawer().element());
  expect(box.right).toBeCloseTo(innerWidth, 0);
  expect(box.height).toBeCloseTo(innerHeight, 0);
  expect(box.width).toBeLessThan(innerWidth);
});

it("Drawer on the left sits at the left edge, full height", async () => {
  await open({ side: "left" });
  const box = rect(drawer().element());
  expect(box.left).toBeCloseTo(0, 0);
  expect(box.height).toBeCloseTo(innerHeight, 0);
});

it("Drawer on top sits at the top edge, full width", async () => {
  await open({ side: "top" });
  const box = rect(drawer().element());
  expect(box.top).toBeCloseTo(0, 0);
  expect(box.width).toBeCloseTo(innerWidth, 0);
});

it("Drawer closes on Escape and gives focus back to the trigger", async () => {
  await open();
  await userEvent.keyboard("{Escape}");
  await closed();
  expect(document.activeElement).toBe(trigger().element());
});

it("Drawer closes from a DrawerClose and on a click on the backdrop", async () => {
  await open();
  await userEvent.click(page.getByRole("button", { name: "Done" }));
  await closed();
  await userEvent.click(trigger());
  await expect.element(drawer()).toBeVisible();
  await settled(document.body);
  await userEvent.click(document.body, { position: { x: 10, y: 10 } });
  await closed();
});

it("Drawer closes with the swipe reason when the sheet is dragged down toward its edge", async () => {
  const onOpenChange = vi.fn<NonNullable<ShareDrawerProps["onOpenChange"]>>();
  await open({ onOpenChange });
  const bar = page.elementLocator(part(document.body, "drawer-grab-bar"));
  const viewport = page.elementLocator(part(document.body, "drawer-viewport"));
  await userEvent.dragAndDrop(bar, viewport, { targetPosition: { x: innerWidth / 2, y: innerHeight - 4 } });
  await closed();
  expect(onOpenChange.mock.calls.map(([isOpen, { reason }]) => [isOpen, reason])).toStrictEqual([
    [true, "trigger-press"],
    [false, "swipe"],
  ]);
});
