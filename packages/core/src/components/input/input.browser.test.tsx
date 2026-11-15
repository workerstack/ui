import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { NO_RING, settled, style, token } from "../../test/browser.ts";
import { inputElement } from "../../test/dom.ts";
import { Field, FieldLabel } from "../field/index.ts";
import { Input, InputClear, InputGroup, type InputProps } from "./index.ts";

type OnValueChange = NonNullable<InputProps["onValueChange"]>;

afterEach(cleanup);

it("Input reports real typing through onValueChange", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <Input aria-label="Name" onValueChange={onValueChange} />);
  const input = page.getByRole("textbox", { name: "Name" });
  await userEvent.type(input, "Ada");
  expect(inputElement(input.element()).value).toBe("Ada");
  expect(onValueChange.mock.calls.map(([value]) => value)).toStrictEqual(["A", "Ad", "Ada"]);
});

it("Input is 36px tall with the input border, and rings when focused", async () => {
  render(() => <Input aria-label="Name" />);
  const input = page.getByRole("textbox", { name: "Name" }).element();
  expect(style(input).height).toBe("36px");
  expect(style(input).borderTopColor).toBe(token("--ui-input"));
  await userEvent.tab();
  expect(document.activeElement).toBe(input);
  await settled(input);
  expect(style(input).borderTopColor).toBe(token("--ui-ring"));
  expect(style(input).boxShadow).not.toMatch(NO_RING);
});

it("Input draws an invalid input's border in the destructive color", () => {
  render(() => (
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
    </Field>
  ));
  const input = page.getByRole("textbox", { name: "Email" }).element();
  expect(style(input).borderTopColor).toBe(token("--ui-destructive"));
});

it("InputGroup draws one control: the inner input loses its own border and fills the group", () => {
  render(() => (
    <InputGroup data-testid="group">
      <span>$</span>
      <Input aria-label="Amount" />
    </InputGroup>
  ));
  const group = page.getByTestId("group").element();
  const input = page.getByRole("textbox", { name: "Amount" }).element();
  expect(style(group).borderTopColor).toBe(token("--ui-input"));
  expect(style(input).borderTopWidth).toBe("0px");
  expect(input.getBoundingClientRect().height).toBeCloseTo(group.getBoundingClientRect().height - 2, 0);
  expect(style(page.getByText("$").element()).color).toBe(token("--ui-muted-foreground"));
});

it("InputGroup rings the whole group while its input has keyboard focus", async () => {
  render(() => (
    <InputGroup data-testid="group">
      <Input aria-label="Search" />
    </InputGroup>
  ));
  const group = page.getByTestId("group").element();
  const resting = style(group).boxShadow;
  await userEvent.tab();
  await settled(group);
  expect(style(group).borderTopColor).toBe(token("--ui-ring"));
  expect(style(group).boxShadow).not.toBe(resting);
});

it("InputGroup empties the input and returns focus to it when the clear button is clicked", async () => {
  render(() => (
    <InputGroup>
      <Input aria-label="Search" defaultValue="solid" />
      <InputClear aria-label="Clear search" />
    </InputGroup>
  ));
  const input = page.getByRole("textbox", { name: "Search" });
  await userEvent.click(page.getByRole("button", { name: "Clear search" }));
  expect(inputElement(input.element()).value).toBe("");
  expect(document.activeElement).toBe(input.element());
});
