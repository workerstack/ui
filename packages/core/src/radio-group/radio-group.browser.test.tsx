import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { part, rect, style, token } from "../test/browser.ts";
import { PlanGroup, type PlanGroupProps } from "./__fixtures__/plan-group.fixture.tsx";

afterEach(cleanup);

/** The size of a radio and of its dot, in px. */
const RADIO_SIZE = 16;
const DOT_SIZE = 8;

function radio(name: string): ReturnType<typeof page.getByRole> {
  return page.getByRole("radio", { name });
}

it("RadioGroup selects with a real click on the radio", async () => {
  const onValueChange = vi.fn<NonNullable<PlanGroupProps["onValueChange"]>>();
  render(() => <PlanGroup onValueChange={onValueChange} />);
  await userEvent.click(radio("Pro"));
  await expect.element(radio("Pro")).toBeChecked();
  expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("pro");
});

it("RadioGroup selects with a real click on the label text", async () => {
  render(() => <PlanGroup />);
  await userEvent.click(page.getByText("Team"));
  await expect.element(radio("Team")).toBeChecked();
});

it("RadioGroup moves and selects with the arrow keys from one tab stop", async () => {
  render(() => <PlanGroup defaultValue="free" />);
  await userEvent.tab();
  expect(document.activeElement).toBe(radio("Free").element());
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(radio("Pro")).toBeChecked();
  expect(document.activeElement).toBe(radio("Pro").element());
  await userEvent.keyboard("{ArrowDown}{ArrowDown}");
  await expect.element(radio("Free")).toBeChecked();
});

it("RadioGroup skips a disabled radio with real arrow keys", async () => {
  render(() => <PlanGroup defaultValue="free" proDisabled />);
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(radio("Team")).toBeChecked();
});

it("RadioGroup draws the dot only in the selected radio", () => {
  render(() => <PlanGroup defaultValue="pro" />);
  const checked = radio("Pro").element();
  const dot = part(checked, "radio-indicator");
  expect(rect(dot).width).toBe(DOT_SIZE);
  expect(rect(dot).height).toBe(DOT_SIZE);
  expect(style(dot).backgroundColor).toBe(token("--ui-primary"));
  expect(style(dot).borderRadius).toBe("50%");
  expect(radio("Free").element().querySelector('[data-slot="radio-indicator"]')).toBeNull();
});

it("RadioGroup moves the dot to the radio a click selects", async () => {
  render(() => <PlanGroup defaultValue="pro" />);
  await userEvent.click(radio("Team"));
  await expect.element(radio("Team")).toBeChecked();
  expect(part(radio("Team").element(), "radio-indicator").checkVisibility()).toBe(true);
  await vi.waitFor(() => expect(radio("Pro").element().querySelector('[data-slot="radio-indicator"]')).toBeNull());
});

it("RadioGroup draws a 16 by 16 round radio with an input border", () => {
  render(() => <PlanGroup />);
  const el = radio("Free").element();
  expect(rect(el).width).toBe(RADIO_SIZE);
  expect(rect(el).height).toBe(RADIO_SIZE);
  // `rounded-full` computes to a huge radius, so the box is a circle.
  expect(Number.parseFloat(style(el).borderRadius)).toBeGreaterThanOrEqual(RADIO_SIZE / 2);
  expect(style(el).borderTopWidth).toBe("1px");
  expect(style(el).borderTopColor).toBe(token("--ui-input"));
});

it("RadioGroup colors the checked radio's border with the primary color", () => {
  render(() => <PlanGroup defaultValue="pro" />);
  expect(style(radio("Pro").element()).borderTopColor).toBe(token("--ui-primary"));
});

it("RadioGroup draws a focus ring on keyboard focus", async () => {
  render(() => <PlanGroup />);
  const el = radio("Free").element();
  const resting = style(el).boxShadow;
  await userEvent.tab();
  expect(document.activeElement).toBe(el);
  await vi.waitFor(() => expect(style(el).boxShadow).not.toBe(resting));
  expect(style(el).borderTopColor).toBe(token("--ui-ring"));
});

it("RadioGroup dims a disabled radio and its label", () => {
  render(() => <PlanGroup proDisabled />);
  const el = radio("Pro").element();
  expect(style(el).opacity).toBe("0.5");
  expect(style(el).cursor).toBe("not-allowed");
  expect(style(page.getByText("Pro").element()).opacity).toBe("0.5");
  expect(style(page.getByText("Free").element()).opacity).toBe("1");
});

it("RadioGroup stacks its options in a grid with a gap", () => {
  render(() => <PlanGroup />);
  const group = page.getByRole("radiogroup", { name: "Plan" }).element();
  expect(style(group).display).toBe("grid");
  expect(style(group).rowGap).toBe("12px");
  const free = rect(radio("Free").element());
  const pro = rect(radio("Pro").element());
  expect(pro.top).toBeGreaterThan(free.bottom);
});

it("RadioGroup centers the radio on its label's line", () => {
  render(() => <PlanGroup />);
  const el = rect(radio("Free").element());
  const label = rect(page.getByText("Free").element());
  expect(Math.abs(el.top + el.height / 2 - (label.top + label.height / 2))).toBeLessThanOrEqual(1);
});

it("RadioGroup colors the border of an invalid radio with the destructive color", () => {
  render(() => <PlanGroup invalid defaultValue="pro" />);
  expect(style(radio("Free").element()).borderTopColor).toBe(token("--ui-destructive"));
  expect(style(radio("Pro").element()).borderTopColor).toBe(token("--ui-destructive"));
});

// Last in the file: tabbing out of the page leaves focus outside it for the next test.
it("RadioGroup takes one Tab to enter and one to leave", async () => {
  render(() => <PlanGroup defaultValue="pro" />);
  await userEvent.tab();
  expect(document.activeElement).toBe(radio("Pro").element());
  await userEvent.tab();
  expect(document.activeElement).not.toBe(radio("Free").element());
  expect(document.activeElement).not.toBe(radio("Team").element());
});
