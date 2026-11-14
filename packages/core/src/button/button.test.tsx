import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { TranslatedLoadingButtonFixture } from "./__fixtures__/button.loading.fixture.tsx";
import { deferred } from "./__fixtures__/deferred.ts";
import { Button, buttonClass } from "./index.ts";

afterEach(cleanup);

it("Button renders a type=button with its variant and size classes", () => {
  render(() => (
    <Button variant="outline" size="sm">
      Save
    </Button>
  ));
  const button = screen.getByRole("button", { name: "Save" });
  expect(button.getAttribute("type")).toBe("button");
  expect(button.getAttribute("data-slot")).toBe("button");
  expect(button.className).toContain("border-input");
  expect(button.className).toContain("h-8");
});

it("Button lets the consumer's class win over its own", () => {
  render(() => <Button class="h-12 px-8">Big</Button>);
  const button = screen.getByRole("button", { name: "Big" });
  expect(button.className).toContain("h-12 px-8");
  expect(button.className).not.toContain("h-9");
  expect(button.className).not.toContain("px-4");
});

it("Button takes a class that is a function of its state", async () => {
  const pending = deferred();
  render(() => (
    <Button onClick={() => pending.promise} class={(state) => (state.pending ? "is-pending" : "is-idle")}>
      Save
    </Button>
  ));
  const button = screen.getByRole("button", { name: "Save" });
  expect(button.className).toContain("is-idle");
  fireEvent.click(button);
  await vi.waitFor(() => expect(button.hasAttribute("data-pending")).toBe(true));
  expect(button.className).toContain("is-pending");
  pending.resolve();
  await vi.waitFor(() => expect(button.hasAttribute("data-pending")).toBe(false));
});

it("Button ignores presses while a Promise from onClick is pending", async () => {
  const pending = deferred();
  const onClick = vi.fn<() => Promise<void>>(() => pending.promise);
  render(() => <Button onClick={onClick}>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });
  fireEvent.click(button);
  await vi.waitFor(() => expect(button.getAttribute("aria-busy")).toBe("true"));
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  pending.resolve();
  await vi.waitFor(() => expect(button.hasAttribute("aria-busy")).toBe(false));
});

it("buttonClass defaults to the primary, medium button", () => {
  expect(buttonClass()).toContain("bg-primary");
  expect(buttonClass()).toContain("h-9");
});

it("Button while loading is busy, disabled and says it loads", () => {
  render(() => <Button loading>Save</Button>);
  const button = screen.getByRole("button", { name: /Loading/ });
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
});

it("Button ignores a click while loading", () => {
  const onClick = vi.fn<() => void>();
  render(() => (
    <Button loading onClick={onClick}>
      Save
    </Button>
  ));
  fireEvent.click(screen.getByRole("button"));
  expect(onClick).not.toHaveBeenCalled();
});

it("Button leaves the loading state off by default and has no spinner", () => {
  render(() => <Button>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });
  expect(button.hasAttribute("aria-busy")).toBe(false);
  expect(button.hasAttribute("disabled")).toBe(false);
  expect(screen.queryByRole("status")).toBeNull();
});

it("Button says it loads in the provider's language", () => {
  render(() => <TranslatedLoadingButtonFixture />);
  expect(screen.getByRole("status", { name: "Učitavanje" })).toBeTruthy();
});

it("Button stays disabled after loading ends when disabled is set", () => {
  render(() => <Button disabled>Save</Button>);
  expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
});

it("Button shows its disclosure chevron without making it a name", () => {
  render(() => <Button disclosure>Menu</Button>);
  const button = screen.getByRole("button", { name: "Menu" });
  expect(button.querySelector('[data-icon="chevron"]')?.getAttribute("aria-hidden")).toBe("true");
});

it("buttonClass carries the soft variant, the xs and xl sizes and the inline size", () => {
  expect(buttonClass({ variant: "soft" })).toContain("bg-primary/10");
  expect(buttonClass({ size: "xs" })).toContain("h-6");
  expect(buttonClass({ size: "xl" })).toContain("h-11");
  expect(buttonClass({ inlineSize: "fill" })).toContain("w-full");
  expect(buttonClass({ inlineSize: "fit-content" })).toContain("w-fit");
  expect(buttonClass({ variant: "link" })).not.toContain("translate-y-px");
});
