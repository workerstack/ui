import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { Input } from "../input/index.ts";
import { style, token } from "../test/browser.ts";
import { inputElement } from "../test/dom.ts";
import { required } from "../test/required.ts";
import { Field, FieldDescription, FieldError, FieldLabel } from "./index.ts";

afterEach(cleanup);

/** The flex gap between a Field's parts, in px. */
const GAP = 8;

/** Slack for subpixel layout when comparing positions. */
const SUBPIXEL = 0.5;

it("Field focuses the control when the label is clicked", async () => {
  render(() => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
    </Field>
  ));
  await userEvent.click(page.getByText("Email"));
  expect(document.activeElement).toBe(page.getByRole("textbox", { name: "Email" }).element());
});

it("Field stacks its parts with a gap", () => {
  render(() => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>Hint</FieldDescription>
    </Field>
  ));
  const field = required(page.getByText("Email").element().parentElement, "the label's field");
  expect(style(field).flexDirection).toBe("column");
  expect(style(field).rowGap).toBe(`${GAP}px`);
  const label = page.getByText("Email").element().getBoundingClientRect();
  const input = page.getByRole("textbox").element().getBoundingClientRect();
  expect(input.top).toBeGreaterThanOrEqual(label.bottom + GAP - SUBPIXEL);
});

it("Field paints the label, description and error from the theme", () => {
  render(() => (
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>Hint</FieldDescription>
      <FieldError match>Taken</FieldError>
    </Field>
  ));
  expect(style(page.getByText("Email").element()).color).toBe(token("--ui-destructive"));
  expect(style(page.getByText("Hint").element()).color).toBe(token("--ui-muted-foreground"));
  expect(style(page.getByText("Taken").element()).color).toBe(token("--ui-destructive"));
});

it("Field dims a disabled field's label", () => {
  render(() => (
    <Field disabled>
      <FieldLabel>Email</FieldLabel>
      <Input />
    </Field>
  ));
  expect(style(page.getByText("Email").element()).opacity).toBe("0.5");
  expect(inputElement(page.getByRole("textbox").element()).disabled).toBe(true);
});
