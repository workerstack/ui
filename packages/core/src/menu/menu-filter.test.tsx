import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { UiProvider } from "../provider/index.ts";
import { inputElement, mounted, type } from "../test/dom.ts";
import { ProjectMenu } from "./__fixtures__/project-menu.fixture.tsx";
import { Menu, MenuContent, MenuEmpty, MenuFilter, MenuItem, MenuList, MenuTrigger, type MenuProps } from "./index.ts";

afterEach(cleanup);

type OnAction = NonNullable<MenuProps["onAction"]>;

const EVERY_PROJECT = ["Café redesign", "Payments", "Onboarding"];

/** The names of the items on screen, in order. */
function shown(): (string | null)[] {
  return screen.queryAllByRole("menuitem").map((item) => item.textContent);
}

/** Opens the menu from its trigger and returns the filter's input, found by its accessible name. */
async function open(filterName = "Filter"): Promise<HTMLInputElement> {
  await mounted();
  fireEvent.click(screen.getByRole("button", { name: "Move to project" }));

  return inputElement(await screen.findByRole("searchbox", { name: filterName }));
}

it("MenuFilter narrows by the items' text, ignoring accents, and by an item's label", async () => {
  render(() => <ProjectMenu />);
  const filter = await open();
  expect(shown()).toStrictEqual(EVERY_PROJECT);
  type(filter, "cafe");
  await vi.waitFor(() => expect(shown()).toStrictEqual(["Café redesign"]));
  type(filter, "bill");
  await vi.waitFor(() => expect(shown()).toStrictEqual(["Payments"]));
  type(filter, "ÓNBOARD");
  await vi.waitFor(() => expect(shown()).toStrictEqual(["Onboarding"]));
});

it("MenuGroup hides when none of its items match and MenuEmpty shows when nothing matches", async () => {
  render(() => <ProjectMenu />);
  const filter = await open();
  type(filter, "pay");
  await vi.waitFor(() => expect(screen.getByTestId("archived").hidden).toBe(true));
  expect(screen.getByTestId("active").hidden).toBe(false);
  expect(screen.queryByText("No results")).toBeNull();
  type(filter, "zzz");
  expect(await screen.findByText("No results")).toBeDefined();
  expect(shown()).toStrictEqual([]);
  type(filter, "");
  await vi.waitFor(() => expect(shown()).toStrictEqual(EVERY_PROJECT));
  expect(screen.queryByText("No results")).toBeNull();
  expect(screen.getByTestId("archived").hidden).toBe(false);
});

it("MenuFilter highlights the first match so Enter runs it", async () => {
  const onAction = vi.fn<OnAction>();
  render(() => <ProjectMenu onAction={onAction} />);
  const filter = await open();
  type(filter, "on");
  const onboarding = screen.getByRole("menuitem", { name: "Onboarding" });
  await vi.waitFor(() => expect(onboarding.hasAttribute("data-highlighted")).toBe(true));
  expect(document.activeElement).toBe(filter);
  fireEvent.keyDown(filter, { key: "Enter" });
  await vi.waitFor(() => expect(onAction).toHaveBeenCalledExactlyOnceWith("onboarding", expect.anything()));
});

it("MenuFilter starts over with an empty query when the menu reopens", async () => {
  render(() => <ProjectMenu />);
  const filter = await open();
  type(filter, "pay");
  await vi.waitFor(() => expect(shown()).toStrictEqual(["Payments"]));
  fireEvent.keyDown(filter, { key: "Escape" });
  await vi.waitFor(() => expect(screen.queryByRole("searchbox")).toBeNull());
  const again = await open();
  expect(again.value).toBe("");
  expect(shown()).toStrictEqual(EVERY_PROJECT);
});

it("MenuList narrows only the items inside it", async () => {
  render(() => (
    <Menu>
      <MenuTrigger>Move to project</MenuTrigger>
      <MenuContent>
        <MenuFilter />
        <MenuList>
          <MenuItem value="design">Design</MenuItem>
          <MenuItem value="research">Research</MenuItem>
        </MenuList>
        <MenuItem value="create">New project</MenuItem>
      </MenuContent>
    </Menu>
  ));
  const filter = await open();
  type(filter, "res");
  await vi.waitFor(() => expect(shown()).toStrictEqual(["Research", "New project"]));
});

it("MenuFilter and MenuEmpty take their strings from the provider", async () => {
  render(() => (
    <UiProvider messages={{ menuFilter: "Filtrer", noResults: "Aucun résultat" }}>
      <ProjectMenu />
    </UiProvider>
  ));
  const filter = await open("Filtrer");
  expect(filter.placeholder).toBe("Filtrer");
  type(filter, "zzz");
  expect(await screen.findByText("Aucun résultat")).toBeDefined();
});

it("MenuEmpty shows its own children instead of the provider's string", async () => {
  render(() => (
    <Menu>
      <MenuTrigger>Move to project</MenuTrigger>
      <MenuContent>
        <MenuFilter />
        <MenuEmpty>Nothing here</MenuEmpty>
        <MenuList>
          <MenuItem value="design">Design</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  ));
  type(await open(), "zzz");
  expect(await screen.findByText("Nothing here")).toBeDefined();
  expect(screen.queryByText("No results")).toBeNull();
});

it("MenuFilter sets itself up inside the menu's owner, so Solid warns of no effect left undisposed", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(() => <ProjectMenu />);
  await open();
  const warnings = warn.mock.calls.map((call) => call.map(String).join(" "));
  warn.mockRestore();
  expect(warnings.filter((text) => text.includes("NO_OWNER"))).toStrictEqual([]);
});

it("MenuFilter hands its input to a ref of its own", async () => {
  let input: HTMLInputElement | undefined;
  render(() => (
    <Menu>
      <MenuTrigger>Move to project</MenuTrigger>
      <MenuContent>
        <MenuFilter ref={(element) => (input = element)} />
      </MenuContent>
    </Menu>
  ));
  const filter = await open();
  expect(input).toBe(filter);
});
