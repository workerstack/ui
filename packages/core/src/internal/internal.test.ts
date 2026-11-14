import { expect, it } from "vitest";

import { isStateFunction, withAfter } from "./index.ts";

it("tells a state function from a class or child value", () => {
  expect(isStateFunction(() => "a")).toBe(true);
  expect(isStateFunction("a")).toBe(false);
  expect(isStateFunction(undefined)).toBe(false);
});

it("calls state-function children with the state and leaves values alone", () => {
  expect(withAfter((state: string) => `child ${state}`, "after")("open")).toStrictEqual(["child open", "after"]);
  expect(withAfter("child", "after")("open")).toStrictEqual(["child", "after"]);
});
