import { cleanup, render } from "@solidjs/testing-library";
import type { JSX } from "@solidjs/web";
import { expect, vi } from "vitest";
import { page } from "vitest/browser";

import { pointer } from "@workerstack/testing/web/dom";

/** A reading direction the harness renders in. */
export type Direction = "ltr" | "rtl";

/** Both reading directions: the monorepo ran its specs in a left-to-right and a right-to-left project. */
export const DIRECTIONS: Direction[] = ["ltr", "rtl"];

/** The arrow toward the inline end: arrows are physical, so the next column or chip sits to the left in RTL. */
export const NEXT_KEY: Record<Direction, string> = { ltr: "{ArrowRight}", rtl: "{ArrowLeft}" };

/** The desktop viewport every browser test starts in. */
const DESKTOP = { height: 768, width: 1024 };

/** Renders a harness page in `dir` and waits a frame, so the engine has bound its lists. */
export async function mount(ui: () => JSX.Element, dir: Direction = "ltr"): Promise<void> {
  document.documentElement.dir = dir;
  render(ui);
  await pointer.frame();
}

/** Sizes the viewport for a test; `unmount` puts the desktop one back. */
export async function viewport(width: number, height: number): Promise<void> {
  await page.viewport(width, height);
}

/**
 * Waits out a running drop, then unmounts the page and puts the direction, the scroll, the URL hash and the viewport
 * back. The monorepo's specs got a fresh page each; here a drop still settling would hold the next test's lift.
 */
export async function unmount(): Promise<void> {
  await vi.waitFor(() => expect(document.documentElement.hasAttribute("data-dnd-active")).toBe(false));
  cleanup();
  document.documentElement.removeAttribute("dir");
  history.replaceState(null, "", location.pathname + location.search);
  scrollTo(0, 0);
  if (innerWidth !== DESKTOP.width || innerHeight !== DESKTOP.height) await page.viewport(DESKTOP.width, DESKTOP.height);
}
