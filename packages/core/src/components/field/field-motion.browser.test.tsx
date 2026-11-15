import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { rect, settled, style } from "../../test/browser.ts";
import { required } from "../../test/required.ts";
import { MotionField } from "./__fixtures__/motion.fixture.tsx";

afterEach(cleanup);

/** How long to watch an animation that should not run, in ms. */
const WATCH = 60;

/** Slack for subpixel layout when comparing sizes. */
const SUBPIXEL = 0.5;

function error(): Element | null {
  return document.querySelector("[data-slot=field-error]");
}

function description(): Element {
  return required(document.querySelector("[data-slot=field-description]"), "the description");
}

// The error's height in the first frame it is in the page, before any transition has run.
function heightOnInsert(): Promise<number> {
  return new Promise((resolve) => {
    const watch = new MutationObserver(() => {
      watch.disconnect();
      resolve(rect(required(error(), "the error")).height);
    });

    watch.observe(document.body, { childList: true, subtree: true });
  });
}

it("FieldError opens from nothing to its height", async () => {
  render(() => <MotionField />);

  const first = heightOnInsert();

  await userEvent.click(page.getByText("Toggle"));

  expect(await first).toBeLessThan(1);

  const shown = required(error(), "the error");

  await settled(shown);

  expect(rect(shown).height).toBeGreaterThan(SUBPIXEL);
  expect(style(shown).opacity).toBe("1");
});

it("FieldDescription collapses while the error shows and returns when it goes", async () => {
  render(() => <MotionField />);
  const full = rect(description()).height;
  expect(full).toBeGreaterThan(SUBPIXEL);
  await userEvent.click(page.getByText("Toggle"));
  await settled(description());
  expect(rect(description()).height).toBeLessThan(SUBPIXEL);
  expect(style(description()).visibility).toBe("hidden");
  await userEvent.click(page.getByText("Toggle"));
  await settled(description());
  expect(rect(description()).height).toBeCloseTo(full, 0);
  expect(style(description()).visibility).toBe("visible");
});

// UI SDK 0.1.0-beta.2 removes a FieldError from the page the moment the field is valid again and
// sets no data-ending-style, so nothing is left to animate. When this starts passing, the upstream
// fix has landed: drop `.fails` and let the error close like it opens.
it.fails("FieldError animates out when the field turns valid", async () => {
  render(() => <MotionField />);
  await userEvent.click(page.getByText("Toggle"));
  await settled(required(error(), "the error"));
  await userEvent.click(page.getByText("Toggle"));
  await new Promise((resolve) => setTimeout(resolve, WATCH / 4));
  expect(error()?.hasAttribute("data-ending-style")).toBe(true);
});
