import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { inputElement, mounted, type } from "../../test/dom.ts";
import { UiProvider } from "../provider/index.ts";
import { CreateCombobox } from "./__fixtures__/create-combobox.fixture.tsx";
import type { FruitValueChange } from "./__fixtures__/fruit-combobox.fixture.tsx";

afterEach(cleanup);

it("Combobox creates an option from the typed text and selects it", async () => {
  const onCreate = vi.fn<(label: string) => string>((label) => label);
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => <CreateCombobox onCreate={onCreate} onValueChange={onValueChange} />);
  await mounted();
  const input = inputElement(screen.getByRole("combobox", { name: "Label" }));
  type(input, "Docs");
  fireEvent.click(await screen.findByRole("option", { name: "Create “Docs”" }));
  await vi.waitFor(() => expect(onCreate).toHaveBeenCalledWith("Docs"));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("Docs", expect.anything()));
  await vi.waitFor(() => expect(input.value).toBe("Docs"));
});

it("Combobox selects what an async onCreate resolves to", async () => {
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => (
    <CreateCombobox onCreate={(label) => Promise.resolve(label.toUpperCase())} onValueChange={onValueChange} />
  ));
  await mounted();
  type(inputElement(screen.getByRole("combobox", { name: "Label" })), "docs");
  fireEvent.click(await screen.findByRole("option", { name: "Create “docs”" }));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("DOCS", expect.anything()));
});

it("Combobox selects nothing when onCreate returns undefined", async () => {
  const onCreate = vi.fn<() => undefined>();
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => <CreateCombobox onCreate={onCreate} onValueChange={onValueChange} />);
  await mounted();
  type(inputElement(screen.getByRole("combobox", { name: "Label" })), "Docs");
  fireEvent.click(await screen.findByRole("option", { name: "Create “Docs”" }));
  await vi.waitFor(() => expect(onCreate).toHaveBeenCalledWith("Docs"));
  expect(onValueChange).not.toHaveBeenCalled();
});

it("Combobox asks for text before it can create", async () => {
  render(() => <CreateCombobox />);
  await mounted();
  fireEvent.click(screen.getByRole("combobox", { name: "Label" }));
  const hint = await screen.findByRole("option", { name: "Type to create an option" });
  expect(hint.getAttribute("aria-disabled")).toBe("true");
  expect(screen.queryByRole("option", { name: /^Create/ })).toBeNull();
});

it("Combobox says an option already exists instead of offering to create it", async () => {
  render(() => <CreateCombobox />);
  await mounted();
  type(inputElement(screen.getByRole("combobox", { name: "Label" })), "bug");
  const hint = await screen.findByRole("option", { name: "“bug” already exists" });
  expect(hint.getAttribute("aria-disabled")).toBe("true");
  await vi.waitFor(() => expect(screen.queryByRole("option", { name: /^Create/ })).toBeNull());
});

it("Combobox says the create hints in the provider's words", async () => {
  render(() => (
    <UiProvider messages={{ comboboxCreateEmpty: "Tippen zum Erstellen" }}>
      <CreateCombobox />
    </UiProvider>
  ));
  await mounted();
  fireEvent.click(screen.getByRole("combobox", { name: "Label" }));
  expect(await screen.findByRole("option", { name: "Tippen zum Erstellen" })).toBeTruthy();
});

// UI SDK 0.1.0-beta.2: `minLength={0}` is read as 1, so a create row can never start a flow that
// asks for the name itself ("Create new…"). Drop `.fails` when UI SDK honors 0.
it.fails("Combobox offers to create with no text when minLength is 0", async () => {
  render(() => <CreateCombobox minLength={0} />);
  await mounted();
  fireEvent.click(screen.getByRole("combobox", { name: "Label" }));
  expect(await screen.findByRole("option", { name: /^Create/ })).toBeTruthy();
});
