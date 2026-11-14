import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../test/dom.ts";
import { required } from "../test/required.ts";
import { DimensionsPopover } from "./__fixtures__/dimensions-popover.fixture.tsx";

afterEach(cleanup);

/** The popover on screen, if one is shown. */
function visiblePopup(): HTMLElement | undefined {
  return screen.queryAllByRole("dialog").find((el) => el.checkVisibility());
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: "Dimensions" });
}

/** Opens the popover from its trigger and waits until it shows. */
async function open(): Promise<void> {
  await mounted();
  fireEvent.click(trigger());
  await vi.waitFor(() => expect(visiblePopup()).toBeDefined());
}

it("Popover opens from its trigger, named and described by its title and description", async () => {
  render(() => <DimensionsPopover />);
  await mounted();
  expect(visiblePopup()).toBeUndefined();
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
  await open();
  const popup = required(visiblePopup(), "a visible popover");
  expect(popup.getAttribute("aria-labelledby")).toBe(screen.getByText("Set dimensions").id);
  expect(popup.getAttribute("aria-describedby")).toBe(screen.getByText("Set the size of the layer.").id);
  expect(trigger().getAttribute("aria-expanded")).toBe("true");
  expect(trigger().getAttribute("aria-controls")).toBe(popup.id);
  expect(popup.className).toContain("w-72");
  expect(popup.className).toContain("p-4");
});

it("Popover closes from its close button and reports each change", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  render(() => <DimensionsPopover onOpenChange={onOpenChange} />);
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  await vi.waitFor(() => expect(visiblePopup()).toBeUndefined());
  expect(onOpenChange.mock.calls.map(([isOpen]) => isOpen)).toStrictEqual([true, false]);
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
});

it("Popover closes on Escape and gives focus back to the trigger", async () => {
  render(() => <DimensionsPopover />);
  await open();
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  await vi.waitFor(() => expect(visiblePopup()).toBeUndefined());
  await vi.waitFor(() => expect(document.activeElement).toBe(trigger()));
});

it("Popover closes on a press outside it", async () => {
  render(() => <DimensionsPopover />);
  await open();
  fireEvent.pointerDown(screen.getByRole("button", { name: "After" }));
  fireEvent.pointerUp(screen.getByRole("button", { name: "After" }));
  fireEvent.click(screen.getByRole("button", { name: "After" }));
  await vi.waitFor(() => expect(visiblePopup()).toBeUndefined());
});
