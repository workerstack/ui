import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";

import { inputElement, mounted } from "../test/dom.ts";
import { Input, type InputProps } from "./index.ts";

type OnValueChange = NonNullable<InputProps["onValueChange"]>;

afterEach(cleanup);

// A password manager writes the value and sends only `change`, no `input`.
function fill(input: HTMLInputElement, text: string): void {
  // The browser writes through the prototype's setter, as UI SDK expects of a real fill.
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, text);
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

it("a fill that sends only change reaches the value once", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <Input aria-label="Email" onValueChange={onValueChange} />);
  await mounted();
  const input = inputElement(page.getByRole("textbox", { name: "Email" }).element());
  fill(input, "ada@example.com");
  expect(onValueChange.mock.calls.map(([value]) => value)).toStrictEqual(["ada@example.com"]);
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "grace@example.com");
  input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  expect(onValueChange.mock.calls.map(([value]) => value)).toStrictEqual(["ada@example.com", "grace@example.com"]);
});
