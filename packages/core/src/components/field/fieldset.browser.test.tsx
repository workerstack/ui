import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page } from "vitest/browser";

import { rect, style } from "../../test/browser.ts";
import { required } from "../../test/required.ts";
import { AddressFieldset, ChoiceFieldset, Oriented } from "./__fixtures__/fieldset.fixture.tsx";
import { MarkedFieldset } from "./__fixtures__/marks.fixture.tsx";

afterEach(cleanup);

/** Slack for subpixel layout when comparing positions. */
const SUBPIXEL = 0.5;

function box(name: string): DOMRect {
  return rect(page.getByRole("textbox", { name }).element());
}

it("Field puts the label above the control by default", () => {
  render(() => <Oriented orientation="vertical" />);
  const label = rect(page.getByText("Email").element());
  expect(box("Email").top).toBeGreaterThanOrEqual(label.bottom - SUBPIXEL);
  expect(style(required(page.getByText("Email").element().closest("[data-slot=field]"), "the field")).display).toBe(
    "flex",
  );
});

it("Field puts the label beside the control when horizontal", () => {
  render(() => <Oriented orientation="horizontal" />);
  const label = rect(page.getByText("Email").element());
  const field = required(page.getByText("Email").element().closest("[data-slot=field]"), "the field");
  expect(style(field).display).toBe("grid");
  expect(box("Email").left).toBeGreaterThanOrEqual(label.right - SUBPIXEL);
  expect(Math.abs(box("Email").top - label.top)).toBeLessThan(label.height + box("Email").height);
});

it("Field with a label group keeps the group and its link in the label column", () => {
  render(() => <Oriented orientation="horizontal" />);
  const group = required(page.getByText("Help").element().parentElement, "the label group");
  expect(group.getAttribute("data-slot")).toBe("field-label-group");
  expect(rect(group).right).toBeLessThanOrEqual(box("Email").left + SUBPIXEL);
});

it("Field lays out responsive as a grid at the desktop width", () => {
  render(() => <Oriented orientation="responsive" />);
  const field = required(page.getByText("Email").element().closest("[data-slot=field]"), "the field");
  expect(style(field).display).toBe("grid");
  expect(box("Email").left).toBeGreaterThan(rect(page.getByText("Email").element()).left);
});

it("Fieldset stacks the legend, description and fields in a column", () => {
  render(() => <AddressFieldset />);
  const legend = rect(page.getByText("Shipping address").element());
  const description = rect(page.getByText("Where we send the order.").element());
  expect(description.top).toBeGreaterThanOrEqual(legend.bottom - SUBPIXEL);
  expect(box("Street").top).toBeGreaterThan(description.bottom);
  expect(box("City").top).toBeGreaterThan(box("Street").bottom);
});

it("Fieldset sizes a label variant like a field label", () => {
  render(() => <ChoiceFieldset />);
  expect(style(page.getByText("Contact by").element()).fontSize).toBe("14px");
});

it("FieldsetLegend draws the mark after its text", () => {
  render(() => <MarkedFieldset required />);
  const after = getComputedStyle(page.getByText("Contact").element(), "::after");
  expect(after.content).toContain("*");
});
