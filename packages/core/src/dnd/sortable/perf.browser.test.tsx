import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { centerOf, createPointer, type Pointer } from "../../test/pointer.ts";
import { mountBoard } from "../__fixtures__/board-page.fixture.tsx";
import { unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, outcome } from "../__fixtures__/page.fixture.ts";

afterEach(() => {
  vi.restoreAllMocks();

  return unmount();
});

/** A frame's budget at 60Hz, in ms: the lift must fit in one. */
const FRAME_MS = 16;

/** Cards in view whose lifts are timed: the best one is the engine's cost, the rest is the machine's noise. */
const TIMED = ["a0-1", "a1-1", "a2-1", "a3-1", "a0-2"];

/** A lift under way: its pointer, and how long the lift took in ms. */
type Lift = { pointer: Pointer; ms: number };

/** Layout reads the engine makes: box reads and computed styles. */
function layoutReads(): () => number {
  const boxes = vi.spyOn(Element.prototype, "getBoundingClientRect");
  const styles = vi.spyOn(window, "getComputedStyle");

  return () => boxes.mock.calls.length + styles.mock.calls.length;
}

/** Presses card `id` and passes the threshold; returns the pointer and the lift's time in ms. */
function lift(id: string): Lift {
  const from = centerOf(byTestId(`card-${id}`));
  const pointer = createPointer();
  pointer.down(from);
  pointer.at = { x: from.x + 6, y: from.y };
  const start = performance.now();
  pointer.fire("pointermove");

  return { ms: performance.now() - start, pointer };
}

/** Drags card `id` down 120px in `steps` moves within its cell; returns the layout reads the moves made. */
async function dragDown(id: string, steps: number, reads: () => number): Promise<number> {
  const card = byTestId(`card-${id}`);
  const { pointer } = lift(id);

  expect(card.hasAttribute("data-dnd-dragging")).toBe(true);
  const before = reads();
  await pointer.move({ x: pointer.at.x, y: pointer.at.y + 120 }, steps);
  const moved = reads() - before;
  pointer.up();
  await expect.poll(() => card.hasAttribute("data-dnd-dragging")).toBe(false);
  await expect.poll(() => outcome("board")).toContain(id);

  return moved;
}

/** The fastest lift of `ids`, each canceled before the next. */
async function bestLift(ids: string[]): Promise<number> {
  const [id, ...rest] = ids;

  if (id === undefined) return Number.POSITIVE_INFINITY;
  const { ms, pointer } = lift(id);
  expect(byTestId(`card-${id}`).hasAttribute("data-dnd-dragging")).toBe(true);
  await userEvent.keyboard("{Escape}");
  pointer.up();
  await expect.poll(() => outcome("board")).toBe("cancel");
  await expect.poll(() => document.documentElement.hasAttribute("data-dnd-active")).toBe(false);

  return Math.min(ms, await bestLift(rest));
}

it("a 500-card board's layout reads don't grow with a drag's length", async () => {
  await mountBoard("ltr", { cards: 500 });
  const reads = layoutReads();
  const short = await dragDown("a0-1", 10, reads);
  const long = await dragDown("a1-1", 60, reads);
  console.info(`layout reads: 10 moves ${short}, 60 moves ${long}`);

  // The counter sees the reads the lifts and drops made, so a zero above is no blind spot.
  expect(reads()).toBeGreaterThan(0);
  expect(long).toBeLessThanOrEqual(short + 1);
});

it("a 500-card board lifts a card within a frame", async () => {
  await mountBoard("ltr", { cards: 500 });
  const ms = await bestLift(TIMED);
  console.info(`lift ${ms.toFixed(1)}ms`);

  expect(ms).toBeLessThan(FRAME_MS);
});
