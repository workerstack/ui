import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { drawnIcon, glyph, NO_RING, part, rect, settled, style, token } from "../../test/browser.ts";
import { deferred } from "./__fixtures__/deferred.ts";
import { Button } from "./index.ts";

afterEach(cleanup);

/** The computed style of the button named `name`. */
function button(name: string): CSSStyleDeclaration {
  return style(page.getByRole("button", { name }).element());
}

it("Button paints each variant from the theme tokens", () => {
  render(() => (
    <>
      <Button>Primary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
    </>
  ));
  expect(button("Primary").backgroundColor).toBe(token("--ui-primary"));
  expect(button("Primary").color).toBe(token("--ui-primary-foreground"));
  expect(button("Delete").backgroundColor).toBe(token("--ui-destructive"));
  expect(button("Outline").borderTopColor).toBe(token("--ui-input"));
});

it("Button follows a theme switch without UI SDK's pending-filter delay", async () => {
  render(() => <Button>Save</Button>);
  const save = page.getByRole("button", { name: "Save" }).element();
  expect(new Set(style(save).transitionDelay.split(", "))).toStrictEqual(new Set(["0s"]));
  document.documentElement.classList.add("dark");
  await settled(save);
  expect(style(save).backgroundColor).toBe(token("--ui-primary"));
  document.documentElement.classList.remove("dark");
});

it("Button sizes from its size prop, and the consumer's class wins", () => {
  render(() => (
    <>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Icon" />
      <Button class="h-12">Tall</Button>
    </>
  ));
  expect(button("Small").height).toBe("32px");
  expect(button("Medium").height).toBe("36px");
  expect(button("Large").height).toBe("40px");
  expect(button("Icon").width).toBe("36px");
  expect(button("Tall").height).toBe("48px");
});

it("Button presses with a real click, Enter and Space", async () => {
  const onClick = vi.fn<() => void>();
  render(() => <Button onClick={onClick}>Save</Button>);
  await userEvent.click(page.getByRole("button", { name: "Save" }));
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  expect(onClick).toHaveBeenCalledTimes(3);
});

it("Button shows a focus ring when reached with Tab", async () => {
  render(() => <Button>Save</Button>);
  const save = page.getByRole("button", { name: "Save" }).element();
  await userEvent.tab();
  expect(document.activeElement).toBe(save);
  await settled(save);
  expect(style(save).boxShadow).not.toMatch(NO_RING);
});

it("Button ignores a real click while disabled and dims itself", async () => {
  const onClick = vi.fn<() => void>();
  render(() => (
    <Button disabled onClick={onClick}>
      Save
    </Button>
  ));
  await userEvent.click(page.getByRole("button", { name: "Save" }), { force: true });
  expect(onClick).not.toHaveBeenCalled();
  expect(button("Save").opacity).toBe("0.5");
});

it("Button paints the soft variant as a tint under the primary text", () => {
  render(() => <Button variant="soft">Soft</Button>);
  expect(button("Soft").color).toBe(token("--ui-primary"));
  expect(button("Soft").backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(button("Soft").backgroundColor).not.toBe(token("--ui-primary"));
});

it("Button sizes xs and xl", () => {
  render(() => (
    <>
      <Button size="xs">Tiny</Button>
      <Button size="xl">Huge</Button>
    </>
  ));
  expect(button("Tiny").height).toBe("24px");
  expect(button("Huge").height).toBe("44px");
});

it("Button takes its width from inlineSize", () => {
  render(() => (
    <div style={{ width: "400px" }}>
      <Button inlineSize="fill">Fill</Button>
      <Button inlineSize="fit-content">Fit</Button>
    </div>
  ));
  expect(button("Fill").width).toBe("400px");
  expect(Number.parseFloat(button("Fit").width)).toBeLessThan(100);
});

it("Button paints the pressed look while it is expanded", () => {
  render(() => (
    <Button variant="ghost" aria-expanded="true">
      Menu
    </Button>
  ));
  expect(button("Menu").backgroundColor).toBe(token("--ui-muted"));
});

it("Button animates its 1px press-down", () => {
  render(() => <Button>Save</Button>);
  expect(button("Save").transitionProperty).toContain("translate");
});

it("Button grows its tap target to 44px for a coarse pointer", () => {
  render(() => <Button size="xs">Tiny</Button>);

  const rules = [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .map((rule) => rule.cssText)
    .filter((text) => text.includes("pointer: coarse") && text.includes("2.75rem"));

  expect(rules.length).toBeGreaterThan(0);
});

it("Button keeps its width while loading and shows a spinning ring", () => {
  render(() => <Button>Save</Button>);
  const idle = rect(page.getByRole("button", { name: "Save" }).element()).width;
  cleanup();
  render(() => <Button loading>Save</Button>);
  const loading = page.getByRole("button", { name: /Loading/ }).element();
  expect(rect(loading).width).toBe(idle);
  expect(style(part(loading, "button-content")).visibility).toBe("hidden");
  const ring = part(loading, "button-spinner").firstElementChild;
  expect(rect(part(loading, "button-spinner")).width).toBeGreaterThan(0);
  expect(style(ring ?? loading).animationName).toBe("spin");
  expect(style(loading).opacity).toBe("1");
});

it("Button shows the same spinner while a Promise from onClick is pending", async () => {
  const pending = deferred();
  render(() => <Button onClick={() => pending.promise}>Save</Button>);
  const save = page.getByRole("button", { name: "Save" }).element();
  const idle = rect(save).width;
  expect(save.querySelector("[data-slot=button-spinner]")).toBeNull();
  await userEvent.click(save);
  await vi.waitFor(() => expect(rect(part(save, "button-spinner")).width).toBeGreaterThan(0));
  expect(style(part(save, "button-content")).visibility).toBe("hidden");
  expect(rect(save).width).toBe(idle);
  pending.resolve();
});

it("Button draws the disclosure chevron as an icon mask", () => {
  render(() => <Button disclosure>Menu</Button>);
  const menu = page.getByRole("button", { name: "Menu" }).element();
  expect(drawnIcon(part(menu, "button-content").querySelector("[data-icon]") ?? menu, "::before")).toBe(
    glyph("--ui-icon-chevron"),
  );
});
