import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { style } from "../test/browser.ts";
import { inputElement } from "../test/dom.ts";
import { NameField, TextAndPlainInputs } from "./__fixtures__/text-input.fixture.tsx";

afterEach(cleanup);

it("TextInput cleans real typing when Tab leaves the box", async () => {
  render(() => <NameField />);
  const input = page.getByRole("textbox", { name: "Name" });
  await userEvent.click(input);
  await userEvent.keyboard("  Ada Lovelace  ");
  expect(inputElement(input.element()).value).toBe("  Ada Lovelace  ");
  await userEvent.tab();
  expect(inputElement(input.element()).value).toBe("Ada Lovelace");
  await expect.element(page.getByRole("status")).toHaveTextContent("[Ada Lovelace]");
});

it("TextInput looks like an Input: same height, border and padding", () => {
  render(() => <TextAndPlainInputs />);
  const text = page.getByRole("textbox", { name: "Text" }).element();
  const plain = page.getByRole("textbox", { name: "Plain" }).element();
  expect(style(text).height).toBe(style(plain).height);
  expect(style(text).height).toBe("36px");
  expect(style(text).borderTopColor).toBe(style(plain).borderTopColor);
  expect(style(text).paddingLeft).toBe(style(plain).paddingLeft);
});
