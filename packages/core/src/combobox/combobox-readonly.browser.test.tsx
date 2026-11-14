import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page } from "vitest/browser";

import { NO_RING, rect, style } from "../test/browser.ts";
import { required } from "../test/required.ts";
import { StatusCombobox } from "./__fixtures__/status-combobox.fixture.tsx";

afterEach(cleanup);

function box(): Element {
  const group = page.getByRole("combobox", { name: "Status" }).element().closest('[data-slot="combobox-group"]');

  return required(group, "the input inside its box");
}

it("Combobox read-only draws its value with no border, fill or shadow, at the size of the box", async () => {
  render(() => <StatusCombobox defaultValue="open" />);
  await expect.element(page.getByRole("combobox", { name: "Status" })).toBeVisible();
  const editable = rect(box());
  cleanup();
  render(() => <StatusCombobox readOnly defaultValue="open" />);
  await expect.element(page.getByRole("combobox", { name: "Status" })).toBeVisible();
  const el = box();
  expect(style(el).borderTopColor).toMatch(/rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)/);
  expect(style(el).backgroundColor).toMatch(/rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)/);
  expect(style(el).boxShadow).toMatch(NO_RING);
  expect(rect(el).height).toBe(editable.height);
});

it("Combobox draws its start element before the text, outside the pointer's reach", async () => {
  render(() => <StatusCombobox start={<span data-testid="flag">F</span>} />);
  await expect.element(page.getByTestId("flag")).toBeVisible();
  const start = required(box().querySelector("[data-slot=combobox-start]"), "the start element");
  const input = page.getByRole("combobox", { name: "Status" }).element();
  expect(rect(start).right).toBeLessThanOrEqual(rect(input).left + 1);
  expect(style(start).pointerEvents).toBe("none");
});
