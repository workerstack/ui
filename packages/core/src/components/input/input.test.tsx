import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted, type } from "../../test/dom.ts";
import { InvalidEmailField } from "../field/__fixtures__/invalid-email-field.fixture.tsx";
import { Field, FieldDescription, FieldLabel } from "../field/index.ts";
import { CleanInput } from "./__fixtures__/clean-input.fixture.tsx";
import { ClearInput } from "./__fixtures__/clear-input.fixture.tsx";
import { Input, InputClear, InputGroup, type InputProps } from "./index.ts";

type OnValueChange = NonNullable<InputProps["onValueChange"]>;

afterEach(cleanup);

it("Input in a Field is named by the label and described by the description", () => {
  render(() => (
    <Field name="username">
      <FieldLabel>Username</FieldLabel>
      <Input />
      <FieldDescription>Your public name.</FieldDescription>
    </Field>
  ));
  const input = screen.getByRole("textbox", { name: "Username" });
  expect(input.getAttribute("name")).toBe("username");
  const [first = ""] = (input.getAttribute("aria-describedby") ?? "").split(" ");
  expect(first).not.toBe("");
  expect(document.getElementById(first)?.textContent).toBe("Your public name.");
  expect(input.className).toContain("rounded-md");
});

it("Input in a Field marks the input and label invalid when the field is", () => {
  render(() => <InvalidEmailField />);
  const input = screen.getByRole("textbox", { name: "Email" });
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("Email").hasAttribute("data-invalid")).toBe(true);
  expect(screen.getByText("That email is taken.").className).toContain("text-destructive");
});

it("Input reports typed values through onValueChange", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => <Input aria-label="Name" onValueChange={onValueChange} />);
  await mounted();
  type(inputElement(screen.getByRole("textbox", { name: "Name" })), "Ada");
  expect(onValueChange).toHaveBeenLastCalledWith("Ada", expect.anything());
});

it("InputGroup clears the input with InputClear", async () => {
  render(() => (
    <InputGroup>
      <Input aria-label="Search" defaultValue="solid" />
      <InputClear aria-label="Clear search" />
    </InputGroup>
  ));
  const input = inputElement(screen.getByRole("textbox", { name: "Search" }));
  expect(input.value).toBe("solid");
  fireEvent.click(await screen.findByRole("button", { name: "Clear search" }));
  expect(input.value).toBe("");
});

it("InputClear is named Clear by default", async () => {
  render(() => <ClearInput />);
  expect(await screen.findByRole("button", { name: "Clear" })).toBeTruthy();
});

it("InputClear is named from the provider's clear message", async () => {
  render(() => <ClearInput messages={{ clear: "Očisti" }} />);
  expect(await screen.findByRole("button", { name: "Očisti" })).toBeTruthy();
});

it("InputClear keeps a passed aria-label over the provider's message", async () => {
  render(() => <ClearInput ariaLabel="Clear search" messages={{ clear: "Očisti" }} />);
  expect(await screen.findByRole("button", { name: "Clear search" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Očisti" })).toBeNull();
});

async function typeIntoCleanInput(text: string, onValueChange: OnValueChange): Promise<HTMLInputElement> {
  render(() => <CleanInput onValueChange={onValueChange} />);
  await mounted();
  const input = inputElement(screen.getByRole("textbox", { name: "Name" }));
  type(input, text);

  return input;
}

it("Input with clean stores the cleaned value on blur and reports one edit", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  const input = await typeIntoCleanInput("ada", onValueChange);
  expect(onValueChange).toHaveBeenCalledTimes(1);
  fireEvent.blur(input);
  expect(input.value).toBe("ADA");
  expect(await screen.findByText("[ADA]")).toBeTruthy();
  expect(onValueChange).toHaveBeenCalledTimes(2);
  expect(onValueChange).toHaveBeenLastCalledWith("ADA", expect.anything());
});

it("Input with clean fires nothing on blur when the value is already clean", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  const input = await typeIntoCleanInput("ADA", onValueChange);
  onValueChange.mockClear();
  fireEvent.blur(input);
  expect(onValueChange).not.toHaveBeenCalled();
  expect(input.value).toBe("ADA");
});

it("Input with clean leaves a read-only value alone on blur", async () => {
  const onValueChange = vi.fn<OnValueChange>();
  render(() => (
    <Input
      aria-label="Name"
      clean={(text) => text.toUpperCase()}
      defaultValue="ada"
      readonly
      onValueChange={onValueChange}
    />
  ));
  await mounted();
  const input = inputElement(screen.getByRole("textbox", { name: "Name" }));
  fireEvent.blur(input);
  expect(input.value).toBe("ada");
  expect(onValueChange).not.toHaveBeenCalled();
});
