import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";

import { Field, FieldLabel } from "../field/index.ts";
import { UiProvider } from "../provider/index.ts";
import { PRIORITY } from "./__fixtures__/priority.fixture.ts";
import { BooleanView, ChoiceView, choiceText, OptionDot, View } from "./index.ts";

afterEach(cleanup);

function badges(container: HTMLElement): (string | null)[][] {
  return [...container.querySelectorAll<HTMLElement>("[data-slot=badge]")].map((badge) => [
    badge.textContent,
    badge.dataset.color ?? null,
  ]);
}

it("View is an output that the field's label names", () => {
  render(() => (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <View text="Ada" />
    </Field>
  ));
  const output = screen.getByRole("status", { name: "Name" });
  expect(output.tagName).toBe("OUTPUT");
  expect(output.textContent).toBe("Ada");
  expect(output.tabIndex).toBe(0);
  expect(screen.getByText("Name").getAttribute("for")).toBe(output.id);
});

it("View takes its own id and direction", () => {
  const { container } = render(() => <View id="phone" dir="ltr" text="+385 1 234" />);
  const output = container.querySelector("output");
  expect(output?.id).toBe("phone");
  expect(output?.dir).toBe("ltr");
  expect(output?.hasAttribute("tabindex")).toBe(false);
});

it("View shows the empty marker, marked empty, for no text", () => {
  const { container } = render(() => <View text="" />);
  const output = container.querySelector("output");
  expect(output?.textContent).toBe("—");
  expect(output?.hasAttribute("data-empty")).toBe(true);
});

it("View shows children, or the empty marker when they are empty", () => {
  const full = render(() => (
    <View>
      <b>Bold</b>
    </View>
  ));

  expect(full.container.querySelector("output b")?.textContent).toBe("Bold");

  const empty = render(() => (
    <View empty>
      <b>Bold</b>
    </View>
  ));

  expect(empty.container.querySelector("output")?.textContent).toBe("—");
});

it("View shows the provider's empty marker", () => {
  const { container } = render(() => (
    <UiProvider messages={{ viewEmpty: "n/a" }}>
      <View />
    </UiProvider>
  ));

  expect(container.querySelector("output")?.textContent).toBe("n/a");
});

it("BooleanView reads Yes for true and No for false or nothing", () => {
  const { container } = render(() => (
    <div>
      <BooleanView value />
      <BooleanView value={false} />
      <BooleanView />
    </div>
  ));

  expect([...container.querySelectorAll("output")].map((output) => output.textContent)).toStrictEqual([
    "Yes",
    "No",
    "No",
  ]);
});

it("BooleanView reads the provider's translated Yes and No", () => {
  const { container } = render(() => (
    <UiProvider messages={{ viewNo: "Ne", viewYes: "Da" }}>
      <BooleanView value />
      <BooleanView value={false} />
    </UiProvider>
  ));

  expect([...container.querySelectorAll("output")].map((output) => output.textContent)).toStrictEqual(["Da", "Ne"]);
});

it("ChoiceView shows a colored option as a badge of its color", () => {
  const { container } = render(() => <ChoiceView items={PRIORITY} value="urgent" />);
  expect(badges(container)).toStrictEqual([["Urgent", "danger"]]);
});

it("ChoiceView shows several as badges, a plain one among them neutral", () => {
  const { container } = render(() => <ChoiceView items={PRIORITY} value={["high", "normal", "urgent"]} />);
  expect(badges(container)).toStrictEqual([
    ["High", "warning"],
    ["Normal", "neutral"],
    ["Urgent", "danger"],
  ]);
});

it("ChoiceView keeps plain options as text and nothing chosen as the empty marker", () => {
  const plain = render(() => <ChoiceView items={["Apple"]} value="Apple" />);
  expect(badges(plain.container)).toStrictEqual([]);
  expect(plain.container.textContent).toBe("Apple");
  const normal = render(() => <ChoiceView items={PRIORITY} value="normal" />);
  expect(badges(normal.container)).toStrictEqual([]);
  const empty = render(() => <ChoiceView items={PRIORITY} value={null} />);
  expect(empty.container.textContent).toBe("—");
});

it("ChoiceView takes a value's color from itemToColor when the items are bare values", () => {
  const { container } = render(() => (
    <ChoiceView
      items={["bug", "docs"]}
      value={["bug"]}
      itemToStringLabel={(value) => value.toUpperCase()}
      itemToColor={(value) => (value === "bug" ? "chart-5" : undefined)}
    />
  ));

  expect(badges(container)).toStrictEqual([["BUG", "chart-5"]]);
});

it("ChoiceView puts the view in a fieldset its legend names", () => {
  render(() => <ChoiceView items={PRIORITY} value="normal" legend={<legend>Priority</legend>} />);
  expect(screen.getByRole("group", { name: "Priority" }).textContent).toContain("Normal");
});

it("choiceText joins several labels with commas", () => {
  expect(choiceText(["high", "normal"], PRIORITY)).toBe("High, Normal");
  expect(choiceText("urgent", PRIORITY)).toBe("Urgent");
  expect(choiceText(null, PRIORITY)).toBe("");
});

it("OptionDot is a hidden dot carrying its color", () => {
  const { container } = render(() => <OptionDot color="success" />);
  const dot = container.querySelector("[data-slot=option-dot]");
  expect(dot?.getAttribute("aria-hidden")).toBe("true");
  expect(dot?.getAttribute("data-color")).toBe("success");
});
