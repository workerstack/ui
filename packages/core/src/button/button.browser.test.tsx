import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { NO_RING, settled, style, token } from "../test/browser.ts";
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
