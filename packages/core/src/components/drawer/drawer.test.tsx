import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../../test/dom.ts";
import { ShareDrawer } from "./__fixtures__/share-drawer.fixture.tsx";

afterEach(cleanup);

/** The drawer on screen, if one is shown. */
function visibleDrawer(): HTMLElement | null {
  return screen.queryByRole("dialog");
}

/** Opens the drawer from its trigger and waits until it shows. */
async function open(): Promise<HTMLElement> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Share" }));

  return screen.findByRole("dialog");
}

it("Drawer opens from its trigger, named and described by its title and description", async () => {
  render(() => <ShareDrawer />);
  await mounted();
  expect(visibleDrawer()).toBeNull();
  const drawer = await open();
  expect(drawer.getAttribute("aria-labelledby")).toBe(screen.getByText("Share link").id);
  expect(drawer.getAttribute("aria-describedby")).toBe(screen.getByText("Anyone with the link can view.").id);
  expect(drawer.className).toContain("bg-background");
});

it("Drawer closes from a DrawerClose and reports the change", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  render(() => <ShareDrawer onOpenChange={onOpenChange} />);
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  await vi.waitFor(() => expect(visibleDrawer()).toBeNull());
  expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toStrictEqual([true, false]);
});

it("Drawer closes on Escape", async () => {
  render(() => <ShareDrawer />);
  await open();
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await vi.waitFor(() => expect(visibleDrawer()).toBeNull());
});

it("Drawer shows its grab bar unless showHandle is false", async () => {
  render(() => <ShareDrawer />);
  await open();
  expect(document.querySelector('[data-slot="drawer-grab-bar"]')).not.toBeNull();
  cleanup();
  render(() => <ShareDrawer showHandle={false} />);
  await open();
  expect(document.querySelector('[data-slot="drawer-grab-bar"]')).toBeNull();
});

it("Drawer marks the edge it comes from on its sheet", async () => {
  render(() => <ShareDrawer side="right" />);
  const drawer = await open();
  expect(drawer.getAttribute("data-side")).toBe("right");
});
