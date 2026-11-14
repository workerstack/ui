import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { UiProvider } from "../provider/index.ts";
import { inputElement, mounted, type } from "../test/dom.ts";
import { FruitCombobox, type FruitValueChange } from "./__fixtures__/fruit-combobox.fixture.tsx";
import { TagCombobox, type TagValueChange } from "./__fixtures__/tag-combobox.fixture.tsx";

afterEach(cleanup);

/** The names of the options shown, in order. */
function optionNames(): string[] {
  return screen.queryAllByRole("option").map((option) => option.textContent.trim());
}

/** Types into the Fruit input and waits for UI SDK to have attached its behavior first. */
async function typeFruit(text: string): Promise<HTMLInputElement> {
  await mounted();
  const input = inputElement(screen.getByRole("combobox", { name: "Fruit" }));
  type(input, text);

  return input;
}

it("Combobox in a Field is a combobox named by the label", () => {
  render(() => <FruitCombobox />);
  const input = screen.getByRole("combobox", { name: "Fruit" });
  expect(input.tagName).toBe("INPUT");
  expect(input.getAttribute("aria-expanded")).toBe("false");
  expect(input.getAttribute("placeholder")).toBe("Pick a fruit");
});

it("Combobox filters the options as you type", async () => {
  render(() => <FruitCombobox />);
  await typeFruit("an");
  await vi.waitFor(() => expect(optionNames()).toStrictEqual(["Banana", "Orange"]));
  type(inputElement(screen.getByRole("combobox", { name: "Fruit" })), "ban");
  await vi.waitFor(() => expect(optionNames()).toStrictEqual(["Banana"]));
});

it("Combobox says there are no results when nothing matches", async () => {
  render(() => <FruitCombobox />);
  await typeFruit("zzz");
  expect(await screen.findByText("No results")).toBeTruthy();
  expect(screen.queryAllByRole("option")).toStrictEqual([]);
});

it("Combobox says no results in the provider's words", async () => {
  render(() => (
    <UiProvider messages={{ noResults: "Nichts gefunden" }}>
      <FruitCombobox />
    </UiProvider>
  ));
  await typeFruit("zzz");
  expect(await screen.findByText("Nichts gefunden")).toBeTruthy();
});

it("Combobox picks the highlighted option with the arrow keys and Enter", async () => {
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => <FruitCombobox onValueChange={onValueChange} />);
  await mounted();
  const input = inputElement(screen.getByRole("combobox", { name: "Fruit" }));
  input.focus();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  await screen.findByRole("listbox");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  const banana = await screen.findByRole("option", { name: "Banana" });
  await vi.waitFor(() => expect(banana.hasAttribute("data-highlighted")).toBe(true));
  expect(input.getAttribute("aria-activedescendant")).toBe(banana.id);
  fireEvent.keyDown(input, { key: "Enter" });
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("banana", expect.anything()));
  await vi.waitFor(() => expect(input.value).toBe("Banana"));
});

it("Combobox picks an option with a click and shows its label in the input", async () => {
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => <FruitCombobox onValueChange={onValueChange} />);
  const input = await typeFruit("che");
  fireEvent.click(await screen.findByRole("option", { name: "Cherry" }));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("cherry", expect.anything()));
  await vi.waitFor(() => expect(input.value).toBe("Cherry"));
});

it("Combobox closes on Escape", async () => {
  render(() => <FruitCombobox />);
  const input = await typeFruit("a");
  await screen.findByRole("listbox");
  fireEvent.keyDown(input, { key: "Escape" });
  await vi.waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));
  expect(screen.queryByRole("listbox")?.checkVisibility() ?? false).toBe(false);
});

it("Combobox marks the chosen option selected and shows its check", async () => {
  render(() => <FruitCombobox defaultValue="cherry" />);
  await mounted();
  fireEvent.click(screen.getByRole("combobox", { name: "Fruit" }));
  const cherry = await screen.findByRole("option", { name: "Cherry" });
  expect(cherry.getAttribute("aria-selected")).toBe("true");
  await vi.waitFor(() =>
    expect(cherry.querySelector('[data-slot="combobox-item-indicator"]')?.checkVisibility()).toBe(true),
  );
  expect(
    screen.getByRole("option", { name: "Apple" }).querySelector('[data-slot="combobox-item-indicator"]'),
  ).toBeNull();
});

it("Combobox clears the text and the value with the clear button", async () => {
  const onValueChange = vi.fn<FruitValueChange>();
  render(() => <FruitCombobox defaultValue="apple" showClear onValueChange={onValueChange} />);
  await mounted();
  const input = inputElement(screen.getByRole("combobox", { name: "Fruit" }));
  expect(input.value).toBe("Apple");
  const clear = await screen.findByRole("button", { name: "Clear" });
  expect(clear.getAttribute("data-icon")).toBe("x");
  fireEvent.click(clear);
  await vi.waitFor(() => expect(input.value).toBe(""));
  expect(onValueChange).toHaveBeenLastCalledWith(null, expect.anything());
});

it("Combobox names the clear button in the provider's words", async () => {
  render(() => (
    <UiProvider messages={{ clear: "Leeren" }}>
      <FruitCombobox defaultValue="apple" showClear />
    </UiProvider>
  ));
  await mounted();
  expect(await screen.findByRole("button", { name: "Leeren" })).toBeTruthy();
});

it("Combobox leaves out the chevron when showTrigger is off", async () => {
  const { container } = render(() => <FruitCombobox showTrigger={false} />);
  await mounted();
  expect(container.querySelector('[data-slot="combobox-trigger"]')).toBeNull();
});

it("Combobox multiple shows a chip for each chosen value", async () => {
  render(() => <TagCombobox defaultValue={["bug", "feature"]} />);
  await mounted();
  const chips = [...document.querySelectorAll('[data-slot="combobox-chip"]')].map((chip) => chip.textContent.trim());
  expect(chips).toStrictEqual(["Bug", "Feature"]);
  expect(screen.getByRole("combobox", { name: "Tags" })).toBeTruthy();
});

it("Combobox multiple adds a chip when an option is chosen and keeps the list open", async () => {
  const onValueChange = vi.fn<TagValueChange>();
  render(() => <TagCombobox defaultValue={["bug"]} onValueChange={onValueChange} />);
  await mounted();
  fireEvent.click(screen.getByRole("combobox", { name: "Tags" }));
  fireEvent.click(await screen.findByRole("option", { name: "Design" }));
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["bug", "design"], expect.anything()));
  await vi.waitFor(() => expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(2));
  expect(screen.getByRole("listbox").checkVisibility()).toBe(true);
});

it("Combobox multiple removes a chip with its remove button", async () => {
  const onValueChange = vi.fn<TagValueChange>();
  render(() => <TagCombobox defaultValue={["bug", "design"]} onValueChange={onValueChange} />);
  await mounted();
  const [remove] = screen.getAllByRole("button", { name: "Remove" });
  expect(remove?.getAttribute("data-icon")).toBe("x");
  fireEvent.click(remove ?? document.body);
  await vi.waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["design"], expect.anything()));
  await vi.waitFor(() => expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(1));
});

it("Combobox multiple names the remove buttons in the provider's words", async () => {
  render(() => (
    <UiProvider messages={{ remove: "Entfernen" }}>
      <TagCombobox defaultValue={["bug"]} />
    </UiProvider>
  ));
  await mounted();
  expect(screen.getByRole("button", { name: "Entfernen" })).toBeTruthy();
});
