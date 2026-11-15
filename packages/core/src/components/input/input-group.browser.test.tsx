import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { rect, style } from "../../test/browser.ts";
import { inputElement } from "../../test/dom.ts";
import { AddonGroup, BlockGroup, ReadOnlyGroup } from "./__fixtures__/input-group.fixture.tsx";
import { ReadOnlyInput } from "./__fixtures__/input-rules.fixture.tsx";

afterEach(cleanup);

it("Input read-only draws no border and no fill, at the same height", () => {
  render(() => <ReadOnlyInput value="Pro" />);
  const input = page.getByRole("textbox", { name: "Plan" }).element();
  expect(style(input).borderTopColor).toBe("rgba(0, 0, 0, 0)");
  expect(style(input).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(style(input).height).toBe("36px");
});

it("InputGroup read-only draws no border and no fill around its input", () => {
  render(() => <ReadOnlyGroup />);
  const group = page.getByTestId("group").element();
  expect(style(group).borderTopColor).toBe("rgba(0, 0, 0, 0)");
  expect(style(group).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(inputElement(page.getByRole("textbox", { name: "Handle" }).element()).readOnly).toBe(true);
});

it("InputGroup lays inline addons before and after the input", () => {
  render(() => <AddonGroup />);
  const input = rect(page.getByRole("textbox", { name: "Amount" }).element());
  expect(rect(page.getByText("$").element()).right).toBeLessThanOrEqual(input.left);
  expect(rect(page.getByRole("button", { name: "Copy" }).element()).left).toBeGreaterThanOrEqual(input.right);
});

it("InputGroup stacks block addons above and below its textarea", () => {
  render(() => <BlockGroup />);
  const textarea = rect(page.getByRole("textbox", { name: "Notes" }).element());
  expect(rect(page.getByText("Notes", { exact: true }).element()).bottom).toBeLessThanOrEqual(textarea.top);
  expect(rect(page.getByRole("button", { name: "Send" }).element()).top).toBeGreaterThanOrEqual(textarea.bottom);
});

it("InputGroupButton fits inside the group: 24px by default, 32px small", () => {
  render(() => (
    <>
      <AddonGroup />
      <BlockGroup />
    </>
  ));
  expect(style(page.getByRole("button", { name: "Copy" }).element()).height).toBe("24px");
  expect(style(page.getByRole("button", { name: "Send" }).element()).height).toBe("32px");
});

it("InputGroup focuses the input when its addon text is clicked", async () => {
  render(() => <AddonGroup />);
  await userEvent.click(page.getByText("$"));
  expect(document.activeElement).toBe(page.getByRole("textbox", { name: "Amount" }).element());
});
