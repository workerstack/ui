import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { rect, settled, style, token } from "../../test/browser.ts";
import { required } from "../../test/required.ts";
import { ToastDemo } from "./__fixtures__/toast-demo.fixture.tsx";

afterEach(cleanup);

/** The region's inner gap to the viewport edge (the region's `p-4`). */
const EDGE = 16;

/** How far a swipe drags, past UI SDK's dismissal threshold. */
const SWIPE = 120;

/** A short toast life, so the paused countdown is seen to outlast it. */
const LIFE = 2000;

/** The drag's moves on the way. */
const SWIPE_STEPS = [10, 40, SWIPE];

/** The toasts on screen, newest first. */
function toasts(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-slot="toast"]')];
}

/** Presses a demo button with a real click. */
async function press(name: string): Promise<void> {
  await userEvent.click(page.getByRole("button", { name }));
}

/** Waits until the stack has `count` toasts and has stopped moving. */
async function stackOf(count: number): Promise<void> {
  await expect.poll(() => toasts().length).toBe(count);
  await settled(document.body);
}

/** A pointer event of a mouse, as a real drag sends. */
function pointer(type: string, at: { x: number; y: number }): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: at.x,
    clientY: at.y,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
}

it("Toast stacks at the bottom-right inside the viewport, with the newest in front", async () => {
  render(() => <ToastDemo />);
  await press("Save");
  await press("Fail");
  await stackOf(2);
  const [front, behind] = toasts().map((el) => rect(el));
  const toast = required(front, "the front toast");
  expect(toast.right).toBeCloseTo(innerWidth - EDGE, 0);
  expect(toast.bottom).toBeCloseTo(innerHeight - EDGE, 0);
  expect(toast.width).toBe(384 - 2 * EDGE);
  expect(required(behind, "the toast behind").top).toBeLessThan(toast.top);
  expect(style(required(toasts()[0], "a toast")).backgroundColor).toBe(token("--ui-background"));
});

it("Toast spreads the stack upward, each toast whole, while hovered", async () => {
  render(() => <ToastDemo />);
  await press("Save");
  await press("Fail");
  await stackOf(2);
  await userEvent.hover(required(toasts()[0], "the front toast"));
  await settled(document.body);
  const [front, behind] = toasts().map((el) => rect(el));
  expect(required(behind, "the toast behind").bottom).toBeLessThanOrEqual(required(front, "the front toast").top);
  expect(required(behind, "the toast behind").top).toBeGreaterThanOrEqual(0);
});

it("Toast pauses its countdown while hovered and resumes it after", async () => {
  render(() => <ToastDemo duration={LIFE} />);
  await press("Save");
  // Hover as soon as it shows: under load, waiting for the stack to settle first can outlast its life.
  await expect.poll(() => toasts().length).toBe(1);
  await userEvent.hover(required(toasts()[0], "a toast"));
  await new Promise((resolve) => setTimeout(resolve, LIFE * 2));
  expect(toasts()).toHaveLength(1);
  await userEvent.unhover(required(toasts()[0], "a toast"));
  await expect.poll(() => toasts().length, { timeout: LIFE * 2 }).toBe(0);
});

it("Toast dismisses on Escape", async () => {
  render(() => <ToastDemo />);
  await press("Save");
  await stackOf(1);
  required(toasts()[0], "a toast").focus();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => toasts().length, { timeout: 3000 }).toBe(0);
});

it("Toast keeps a toast that is not dismissible when Escape is pressed", async () => {
  render(() => <ToastDemo />);
  await press("Pin");
  await stackOf(1);
  required(toasts()[0], "a toast").focus();
  await userEvent.keyboard("{Escape}");
  await settled(document.body);
  expect(toasts()).toHaveLength(1);
});

it("Toast dismisses when swiped toward the right edge", async () => {
  render(() => <ToastDemo />);
  await press("Save");
  await stackOf(1);
  const el = required(toasts()[0], "a toast");
  const box = rect(el);
  const start = { x: box.left + 20, y: box.top + box.height / 2 };
  el.dispatchEvent(pointer("pointerdown", start));

  for (const step of SWIPE_STEPS) document.dispatchEvent(pointer("pointermove", { x: start.x + step, y: start.y }));
  document.dispatchEvent(pointer("pointerup", { x: start.x + SWIPE, y: start.y }));
  await expect.poll(() => toasts().length, { timeout: 3000 }).toBe(0);
});
