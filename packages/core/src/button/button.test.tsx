import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { afterEach, expect, it, vi } from "vitest";

import { Button, buttonClass } from "./index.ts";

afterEach(cleanup);

/** A promise and the function that settles it, for an onClick that stays pending until told. */
type Deferred = { promise: Promise<void>; resolve: () => void };

function deferred(): Deferred {
  const settle: Deferred = { promise: Promise.resolve(), resolve() {} };

  settle.promise = new Promise<void>((resolve) => {
    settle.resolve = resolve;
  });

  return settle;
}

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
