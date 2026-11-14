import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { drawnIcon, glyph, NO_RING, part, rect, settled, style, token } from "../test/browser.ts";
import { TermsCheckbox, type TermsCheckboxProps } from "./__fixtures__/terms-checkbox.fixture.tsx";

afterEach(cleanup);

/** A 3px spread shadow: the focus ring. */
const RING = /0px 0px 0px 3px/;

type OnCheckedChange = NonNullable<TermsCheckboxProps["onCheckedChange"]>;

function box(): ReturnType<typeof page.getByRole> {
  return page.getByRole("checkbox", { name: "Accept terms" });
}

it("Checkbox is a 16 by 16 box with the input border and a 4px radius", () => {
  render(() => <TermsCheckbox />);
  const el = box().element();
  expect(rect(el).width).toBe(16);
  expect(rect(el).height).toBe(16);
  expect(style(el).borderTopColor).toBe(token("--ui-input"));
  expect(style(el).borderTopLeftRadius).toBe("4px");
});

it("Checkbox draws no check while unchecked", () => {
  render(() => <TermsCheckbox />);
  expect(box().element().querySelector('[data-slot="checkbox-indicator"]')).toBeNull();
});

it("Checkbox draws the check in the primary foreground on a primary box while checked", () => {
  render(() => <TermsCheckbox defaultChecked />);
  const el = box().element();
  expect(style(el).backgroundColor).toBe(token("--ui-primary"));
  expect(style(el).borderTopColor).toBe(token("--ui-primary"));
  const indicator = part(el, "checkbox-indicator");
  expect(drawnIcon(indicator, "::before")).toBe(glyph("--ui-icon-check"));
  expect(getComputedStyle(indicator, "::before").backgroundColor).toBe(token("--ui-primary-foreground"));
});

it("Checkbox draws the minus mark while indeterminate", () => {
  render(() => <TermsCheckbox defaultChecked="indeterminate" />);
  const el = box().element();
  expect(style(el).backgroundColor).toBe(token("--ui-primary"));
  expect(drawnIcon(part(el, "checkbox-indicator"), "::before")).toBe(glyph("--ui-icon-minus"));
});

it("Checkbox checks and unchecks with a real click and reports it", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox onCheckedChange={onCheckedChange} />);
  await userEvent.click(box());
  await expect.element(box()).toHaveAttribute("aria-checked", "true");
  expect(onCheckedChange.mock.calls.at(-1)?.[0]).toBe(true);
  expect(drawnIcon(part(box().element(), "checkbox-indicator"), "::before")).toBe(glyph("--ui-icon-check"));
  await userEvent.click(page.getByText("Accept terms"));
  await expect.element(box()).toHaveAttribute("aria-checked", "false");
  expect(onCheckedChange.mock.calls.at(-1)?.[0]).toBe(false);
});

it("Checkbox rings on keyboard focus", async () => {
  render(() => <TermsCheckbox />);
  const el = box().element();
  expect(style(el).boxShadow).not.toMatch(RING);
  await userEvent.tab();
  expect(document.activeElement).toBe(el);
  await settled(el);
  expect(style(el).boxShadow).toMatch(RING);
  expect(style(el).borderTopColor).toBe(token("--ui-ring"));
});

it("Checkbox does not ring when a click focuses it", async () => {
  render(() => <TermsCheckbox />);
  const el = box().element();
  await userEvent.click(el);
  await settled(el);
  expect(document.activeElement).toBe(el);
  expect(style(el).boxShadow).not.toMatch(RING);
});

it("Checkbox draws a disabled box dimmed and an invalid box with the destructive border", () => {
  render(() => <TermsCheckbox disabled />);
  expect(style(box().element()).opacity).toBe("0.5");
  cleanup();
  render(() => <TermsCheckbox invalid />);
  expect(style(box().element()).borderTopColor).toBe(token("--ui-destructive"));
});

it("Checkbox read-only keeps its look with a default cursor and no resting shadow", () => {
  render(() => <TermsCheckbox readOnly defaultChecked />);
  const el = box().element();
  expect(style(el).cursor).toBe("default");
  expect(style(el).boxShadow).toMatch(NO_RING);
  expect(style(el).backgroundColor).toBe(token("--ui-primary"));
});
