import { expect, it } from "vitest";

import { cn, cnState } from "./index.ts";

/** The merged class as a function of state; fails the test if cnState returned a plain string. */
function stateful<State>(merged: string | ((state: State) => string)): (state: State) => string {
  expect(merged).toBeTypeOf("function");

  return merged /* just asserted to be the function branch of the union */ as (state: State) => string;
}

it("cn joins strings, arrays and conditional objects", () => {
  expect(cn("flex", ["px-2", { "mt-1": false, "py-1": true }], undefined, null, false)).toBe("flex px-2 py-1");
});

it("cn lets a later Tailwind class win over a conflicting one", () => {
  expect(cn("px-3 py-2 bg-primary", "px-4 bg-destructive")).toBe("py-2 px-4 bg-destructive");
});

it("cn keeps state variants apart from the plain class", () => {
  expect(cn("opacity-100 data-disabled:opacity-50", "opacity-90")).toBe("data-disabled:opacity-50 opacity-90");
});

it("cnState returns a string when neither side is a function", () => {
  expect(cnState("h-9 px-3", "px-4")).toBe("h-9 px-4");
});

it("cnState returns a function of state when the consumer's class is one", () => {
  const merged = stateful(cnState<{ open: boolean }>("h-9 px-3", (state) => (state.open ? "px-6" : undefined)));
  expect(merged({ open: true })).toBe("h-9 px-6");
  expect(merged({ open: false })).toBe("h-9 px-3");
});

it("cnState returns a function of state when the base is one", () => {
  const merged = stateful(
    cnState<{ pending: boolean }>((state) => (state.pending ? "opacity-60" : "opacity-100"), "mt-2"),
  );

  expect(merged({ pending: true })).toBe("opacity-60 mt-2");
});
