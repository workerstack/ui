import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { inputElement, mounted } from "../../test/dom.ts";
import { StatusCombobox } from "./__fixtures__/status-combobox.fixture.tsx";

afterEach(cleanup);

function status(): HTMLInputElement {
  return inputElement(screen.getByRole("combobox", { name: "Status" }));
}

/** The colors of the dots inside the option. */
function dots(name: string): string[] {
  return [...screen.getByRole("option", { name }).querySelectorAll<HTMLElement>("[data-slot=option-dot]")].map(
    (dot) => dot.dataset.color ?? "",
  );
}

it("Combobox read-only shows the value with no placeholder, clear button or chevron", async () => {
  const view = render(() => <StatusCombobox readOnly defaultValue="open" />);
  await mounted();
  expect(status().value).toBe("Open");
  expect(status().hasAttribute("placeholder")).toBe(false);
  expect(view.container.querySelector("[data-slot=combobox-clear]")).toBeNull();
  expect(view.container.querySelector("[data-slot=combobox-trigger]")).toBeNull();
  expect(view.container.querySelector("[data-slot=combobox-group]")?.hasAttribute("data-readonly")).toBe(true);
});

it("Combobox that is not read-only keeps its placeholder and chevron", async () => {
  const view = render(() => <StatusCombobox />);
  await mounted();
  expect(status().getAttribute("placeholder")).toBe("Pick a status");
  expect(view.container.querySelector("[data-slot=combobox-trigger]")).not.toBeNull();
  expect(view.container.querySelector("[data-slot=combobox-group]")?.hasAttribute("data-readonly")).toBe(false);
});

it("Combobox read-only does not open its list", async () => {
  render(() => <StatusCombobox readOnly defaultValue="open" />);
  await mounted();
  await userEvent.click(status());
  expect(screen.queryAllByRole("option")).toStrictEqual([]);
});

it("Combobox puts its start element before the input", async () => {
  const view = render(() => <StatusCombobox start={<span data-testid="flag">F</span>} />);
  await mounted();
  const start = view.container.querySelector("[data-slot=combobox-start]");
  expect(start?.textContent).toBe("F");
  expect(start?.nextElementSibling).toBe(status());
});

it("Combobox shows a dot in the color of a colored item, and none for a plain one", async () => {
  render(() => <StatusCombobox />);
  await mounted();
  await userEvent.click(status());
  await screen.findAllByRole("option");
  expect(dots("Open")).toStrictEqual(["success"]);
  expect(dots("Blocked")).toStrictEqual(["danger"]);
  expect(dots("Later")).toStrictEqual([]);
});

it("Combobox takes an item's dot color from itemToColor over the items' own", async () => {
  render(() => <StatusCombobox itemToColor={(value) => (value === "later" ? "info" : undefined)} />);
  await mounted();
  await userEvent.click(status());
  await screen.findAllByRole("option");
  expect(dots("Later")).toStrictEqual(["info"]);
});
