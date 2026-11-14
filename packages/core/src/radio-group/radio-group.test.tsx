import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { mounted } from "../test/dom.ts";
import { PlanGroup, type PlanGroupProps } from "./__fixtures__/plan-group.fixture.tsx";

afterEach(cleanup);

function radio(name: string): HTMLElement {
  return screen.getByRole("radio", { name });
}

function arrow(el: HTMLElement, key: string): void {
  fireEvent.keyDown(el, { key });
}

it("RadioGroup is a radiogroup named by its Field's label", async () => {
  render(() => <PlanGroup />);
  await mounted();
  expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeTruthy();
});

it("RadioGroup renders one radio per option, named by its own label", async () => {
  render(() => <PlanGroup />);
  await mounted();
  expect(screen.getAllByRole("radio").map((el) => el.getAttribute("aria-checked"))).toStrictEqual([
    "false",
    "false",
    "false",
  ]);
  expect(radio("Free")).toBeTruthy();
  expect(radio("Pro")).toBeTruthy();
  expect(radio("Team")).toBeTruthy();
});

it("RadioGroup checks the default value", async () => {
  render(() => <PlanGroup defaultValue="pro" />);
  await mounted();
  expect(radio("Pro").getAttribute("aria-checked")).toBe("true");
  expect(radio("Free").getAttribute("aria-checked")).toBe("false");
});

it("RadioGroup selects an option on click and unchecks the others", async () => {
  const onValueChange = vi.fn<NonNullable<PlanGroupProps["onValueChange"]>>();
  render(() => <PlanGroup defaultValue="free" onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(radio("Team"));
  await vi.waitFor(() => expect(radio("Team").getAttribute("aria-checked")).toBe("true"));
  expect(radio("Free").getAttribute("aria-checked")).toBe("false");
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

it("RadioGroup selects an option when its label text is clicked", async () => {
  render(() => <PlanGroup />);
  await mounted();
  fireEvent.click(screen.getByText("Pro"));
  await vi.waitFor(() => expect(radio("Pro").getAttribute("aria-checked")).toBe("true"));
});

it("RadioGroup calls onValueChange with the value and why it changed", async () => {
  const onValueChange = vi.fn<NonNullable<PlanGroupProps["onValueChange"]>>();
  render(() => <PlanGroup onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(radio("Pro"));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1));
  expect(onValueChange).toHaveBeenLastCalledWith("pro", expect.objectContaining({ reason: "item-press" }));
});

it("RadioGroup moves the selection with the arrow keys", async () => {
  const onValueChange = vi.fn<NonNullable<PlanGroupProps["onValueChange"]>>();
  render(() => <PlanGroup defaultValue="free" onValueChange={onValueChange} />);
  await mounted();
  radio("Free").focus();
  arrow(radio("Free"), "ArrowDown");
  await vi.waitFor(() => expect(radio("Pro").getAttribute("aria-checked")).toBe("true"));
  expect(radio("Free").getAttribute("aria-checked")).toBe("false");
  expect(onValueChange).toHaveBeenLastCalledWith("pro", expect.objectContaining({ reason: "list-navigation" }));
  arrow(radio("Pro"), "ArrowUp");
  await vi.waitFor(() => expect(radio("Free").getAttribute("aria-checked")).toBe("true"));
});

it("RadioGroup keeps one tab stop, on the checked radio", async () => {
  render(() => <PlanGroup defaultValue="pro" />);
  await mounted();
  expect(screen.getAllByRole("radio").map((el) => el.tabIndex)).toStrictEqual([-1, 0, -1]);
});

it("RadioGroup puts the one tab stop on the first radio while nothing is checked", async () => {
  render(() => <PlanGroup />);
  await mounted();
  expect(screen.getAllByRole("radio").map((el) => el.tabIndex)).toStrictEqual([0, -1, -1]);
});

it("RadioGroup skips a disabled option with the arrow keys", async () => {
  render(() => <PlanGroup defaultValue="free" proDisabled />);
  await mounted();
  radio("Free").focus();
  arrow(radio("Free"), "ArrowDown");
  await vi.waitFor(() => expect(radio("Team").getAttribute("aria-checked")).toBe("true"));
  expect(radio("Pro").getAttribute("aria-checked")).toBe("false");
});

it("RadioGroup does not select a disabled option on click", async () => {
  const onValueChange = vi.fn<NonNullable<PlanGroupProps["onValueChange"]>>();
  render(() => <PlanGroup proDisabled onValueChange={onValueChange} />);
  await mounted();
  expect(radio("Pro").hasAttribute("data-disabled")).toBe(true);
  fireEvent.click(radio("Pro"));
  await mounted();
  expect(radio("Pro").getAttribute("aria-checked")).toBe("false");
  expect(onValueChange).not.toHaveBeenCalled();
});

it("RadioGroup disables every option when the group is disabled", async () => {
  render(() => <PlanGroup disabled defaultValue="pro" />);
  await mounted();

  for (const el of screen.getAllByRole("radio")) expect(el.hasAttribute("data-disabled")).toBe(true);
});

it("RadioGroup keeps its value when read-only", async () => {
  const onValueChange = vi.fn<NonNullable<PlanGroupProps["onValueChange"]>>();
  render(() => <PlanGroup readOnly defaultValue="pro" onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(radio("Team"));
  await mounted();
  expect(radio("Pro").getAttribute("aria-checked")).toBe("true");
  expect(onValueChange).not.toHaveBeenCalled();
});

it("RadioGroup passes its own classes to the group, the radio and the label", async () => {
  render(() => <PlanGroup />);
  await mounted();
  const group = screen.getByRole("radiogroup", { name: "Plan" });
  expect(group.className).toContain("grid gap-3");
  expect(radio("Free").className).toContain("rounded-full");
  expect(radio("Free").closest("label")?.className).toContain("cursor-pointer");
});

it("RadioGroup marks the group invalid when its Field is invalid", async () => {
  render(() => <PlanGroup invalid />);
  await mounted();
  expect(screen.getByRole("radiogroup", { name: "Plan" }).getAttribute("aria-invalid")).toBe("true");
});
