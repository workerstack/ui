import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { style, token } from "../../test/browser.ts";
import { required } from "../../test/required.ts";
import { Field, FieldLabel } from "../field/index.ts";
import { PRIORITY } from "./__fixtures__/priority.fixture.ts";
import { ChoiceView, OptionDot, View } from "./index.ts";

afterEach(cleanup);

/** A color as the browser computes it for a property, probed on a throwaway element. */
function computed(property: "backgroundColor" | "color", value: string): string {
  const probe = document.createElement("div");
  probe.style[property] = value;
  document.body.append(probe);
  const result = getComputedStyle(probe)[property];
  probe.remove();

  return result;
}

it("View paints its empty marker in the muted color and its text in the foreground", () => {
  render(() => (
    <div>
      <View text="Ada" />
      <View />
    </div>
  ));
  expect(style(page.getByText("Ada").element()).color).toBe(token("--ui-foreground"));
  expect(style(page.getByText("—").element()).color).toBe(token("--ui-muted-foreground"));
});

it("View takes focus when it is tabbed to inside a Field", async () => {
  render(() => (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <View text="Ada" />
    </Field>
  ));
  await userEvent.tab();
  expect(document.activeElement).toBe(page.getByRole("status", { name: "Name" }).element());
});

it("ChoiceView tints a badge from the color's token", () => {
  render(() => <ChoiceView items={PRIORITY} value="urgent" />);
  const badge = page.getByText("Urgent").element();
  expect(style(badge).backgroundColor).toBe(
    computed("backgroundColor", "color-mix(in oklab, var(--ui-destructive) 15%, transparent)"),
  );
  expect(style(badge).color).toBe(token("--ui-foreground"));
});

it("ChoiceView lets a root token retheme a badge's color", () => {
  document.documentElement.style.setProperty("--ui-warning", "rgb(10, 20, 30)");
  render(() => <ChoiceView items={PRIORITY} value="high" />);
  expect(style(page.getByText("High").element()).backgroundColor).toBe(
    computed("backgroundColor", "color-mix(in oklab, rgb(10, 20, 30) 15%, transparent)"),
  );
  document.documentElement.style.removeProperty("--ui-warning");
});

it("OptionDot fills with its color's token", () => {
  const { container } = render(() => <OptionDot color="accent" />);
  const dot = required(container.querySelector("[data-slot=option-dot]"), "the dot");
  expect(style(dot).backgroundColor).toBe(token("--ui-primary"));
  expect(style(dot).borderRadius).not.toBe("0px");
});
