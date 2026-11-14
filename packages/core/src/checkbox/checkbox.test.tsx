import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { mounted } from "../test/dom.ts";
import { TermsCheckbox, type TermsCheckboxProps } from "./__fixtures__/terms-checkbox.fixture.tsx";
import { ToppingsGroup, type ToppingsGroupProps } from "./__fixtures__/toppings-group.fixture.tsx";

afterEach(cleanup);

type OnCheckedChange = NonNullable<TermsCheckboxProps["onCheckedChange"]>;

type OnValueChange = NonNullable<ToppingsGroupProps["onValueChange"]>;

function terms(): HTMLElement {
  return screen.getByRole("checkbox", { name: "Accept terms" });
}

function topping(name: string): HTMLElement {
  return screen.getByRole("checkbox", { name });
}

it("Checkbox is a checkbox named by its Field label", async () => {
  render(() => <TermsCheckbox />);
  await mounted();
  const label = screen.getByText("Accept terms");
  expect(label.getAttribute("for")).toBe(terms().id);
  expect(terms().getAttribute("aria-checked")).toBe("false");
  expect(terms().getAttribute("data-slot")).toBe("checkbox");
});

it("Checkbox toggles when its label is clicked", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox onCheckedChange={onCheckedChange} />);
  await mounted();
  fireEvent.click(screen.getByText("Accept terms"));
  await vi.waitFor(() => expect(terms().getAttribute("aria-checked")).toBe("true"));
  expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: "press" }));
});

it("Checkbox toggles on Space and reports the new state", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox onCheckedChange={onCheckedChange} />);
  await mounted();
  terms().focus();
  await userEvent.keyboard(" ");
  await vi.waitFor(() => expect(terms().getAttribute("aria-checked")).toBe("true"));
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: "press" }));
  await userEvent.keyboard(" ");
  await vi.waitFor(() => expect(terms().getAttribute("aria-checked")).toBe("false"));
  expect(onCheckedChange).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: "press" }));
});

it("Checkbox marks its state with data attributes", async () => {
  render(() => <TermsCheckbox defaultChecked />);
  await mounted();
  expect(terms().hasAttribute("data-checked")).toBe(true);
  expect(terms().hasAttribute("data-unchecked")).toBe(false);
  expect(terms().querySelector('[data-slot="checkbox-indicator"]')).not.toBeNull();
});

it("Checkbox shows aria-checked mixed while indeterminate and a press checks it", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />);
  await mounted();
  expect(terms().getAttribute("aria-checked")).toBe("mixed");
  expect(terms().hasAttribute("data-indeterminate")).toBe(true);
  fireEvent.click(terms());
  await vi.waitFor(() => expect(terms().getAttribute("aria-checked")).toBe("true"));
  expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
});

it("Checkbox follows a controlled `checked` and asks to change without changing itself", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox checked={false} onCheckedChange={onCheckedChange} />);
  await mounted();
  fireEvent.click(terms());
  await vi.waitFor(() => expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything()));
  expect(terms().getAttribute("aria-checked")).toBe("false");
});

it("Checkbox ignores presses while disabled", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox disabled onCheckedChange={onCheckedChange} />);
  await mounted();
  expect(terms().hasAttribute("data-disabled")).toBe(true);
  fireEvent.click(terms());
  fireEvent.click(screen.getByText("Accept terms"));
  await mounted();
  expect(onCheckedChange).not.toHaveBeenCalled();
  expect(terms().getAttribute("aria-checked")).toBe("false");
});

it("Checkbox ignores presses while read-only", async () => {
  const onCheckedChange = vi.fn<OnCheckedChange>();
  render(() => <TermsCheckbox readOnly defaultChecked onCheckedChange={onCheckedChange} />);
  await mounted();
  fireEvent.click(terms());
  await mounted();
  expect(onCheckedChange).not.toHaveBeenCalled();
  expect(terms().getAttribute("aria-checked")).toBe("true");
});

it("Checkbox in an invalid Field is aria-invalid", async () => {
  render(() => <TermsCheckbox invalid />);
  await mounted();
  expect(terms().getAttribute("aria-invalid")).toBe("true");
  expect(terms().hasAttribute("data-invalid")).toBe(true);
});

it("Checkbox in a valid Field is not aria-invalid", async () => {
  render(() => <TermsCheckbox />);
  await mounted();
  expect(terms().hasAttribute("aria-invalid")).toBe(false);
});

it("CheckboxGroup reports the checked values as an array", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ToppingsGroup onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(topping("Ham"));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["ham"], expect.anything()));
  fireEvent.click(topping("Cheese"));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["cheese", "ham"], expect.anything()));
  fireEvent.click(topping("Ham"));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["cheese"], expect.anything()));
  expect(topping("Cheese").getAttribute("aria-checked")).toBe("true");
  expect(topping("Ham").getAttribute("aria-checked")).toBe("false");
});

it("CheckboxGroup checks the boxes in its `defaultValue`", async () => {
  render(() => <ToppingsGroup defaultValue={["olive"]} />);
  await mounted();
  expect(topping("Olive").getAttribute("aria-checked")).toBe("true");
  expect(topping("Cheese").getAttribute("aria-checked")).toBe("false");
});

it("CheckboxGroup is a labelled group", async () => {
  render(() => <ToppingsGroup />);
  await mounted();
  const group = screen.getByRole("group", { name: "Toppings" });
  expect(group.getAttribute("data-slot")).toBe("checkbox-group");
  expect(group.className).toContain("flex-col");
});

it("CheckboxGroup parent checks every box, shows mixed for some and unchecks all", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ToppingsGroup withParent onValueChange={onValueChange} />);
  await mounted();
  const all = topping("All");
  expect(all.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(topping("Ham"));
  await vi.waitFor(() => expect(all.getAttribute("aria-checked")).toBe("mixed"));
  fireEvent.click(all);
  await vi.waitFor(() => expect(all.getAttribute("aria-checked")).toBe("true"));
  expect(onValueChange).toHaveBeenLastCalledWith(["cheese", "ham", "olive"], expect.anything());
  fireEvent.click(all);
  await vi.waitFor(() => expect(all.getAttribute("aria-checked")).toBe("false"));
  expect(onValueChange).toHaveBeenLastCalledWith([], expect.anything());
});

it("CheckboxGroup disabled disables every box", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <ToppingsGroup disabled onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(topping("Ham"));
  await mounted();
  expect(onValueChange).not.toHaveBeenCalled();
  expect(topping("Ham").hasAttribute("data-disabled")).toBe(true);
});
