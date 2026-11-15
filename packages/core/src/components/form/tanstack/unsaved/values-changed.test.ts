import { expect, it } from "vitest";

import { isGroup, isList, leaves, valuesChanged } from "./values-changed.ts";

it("valuesChanged compares deeply: Dates by time, lists by order, groups by keys", () => {
  expect(valuesChanged({ at: new Date(1) }, { at: new Date(1) })).toBe(false);
  expect(valuesChanged({ at: new Date(1) }, { at: new Date(2) })).toBe(true);
  expect(valuesChanged(["a", "b"], ["a", "b"])).toBe(false);
  expect(valuesChanged(["a", "b"], ["b", "a"])).toBe(true);
  expect(valuesChanged(["a"], ["a", "b"])).toBe(true);
  expect(valuesChanged({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false);
  expect(valuesChanged({ a: { b: 1 } }, { a: { b: 2 } })).toBe(true);
  expect(valuesChanged("1", 1)).toBe(true);
});

it("valuesChanged reads a revert as unchanged and a key holding undefined as absent", () => {
  expect(valuesChanged({ name: "Ada" }, { name: "Ada" })).toBe(false);
  expect(valuesChanged({ name: "Ada" }, { name: "Ada", note: undefined })).toBe(false);
  expect(valuesChanged({ name: "Ada" }, { name: "Ada", note: "" })).toBe(true);
  expect(valuesChanged(Number.NaN, Number.NaN)).toBe(false);
});

it("isGroup takes plain objects only, and isList takes lists only", () => {
  expect(isGroup({ a: 1 })).toBe(true);
  const bare = Object.create(null) /* an object with no prototype holds no values yet */ as Record<string, never>;

  expect(isGroup(bare)).toBe(true);
  expect(isGroup(new Date(0))).toBe(false);
  expect(isGroup(["a"])).toBe(false);
  expect(isGroup(null)).toBe(false);
  expect(isGroup("a")).toBe(false);
  expect(isList(["a"])).toBe(true);
  expect(isList({ a: 1 })).toBe(false);
  expect(isList("a")).toBe(false);
});

it("leaves lists each path a form's values set, walking groups only", () => {
  const at = new Date(0);

  expect(leaves({ address: { city: "Oslo" }, at, tags: ["a"] })).toStrictEqual([
    ["address.city", "Oslo"],
    ["at", at],
    ["tags", ["a"]],
  ]);
  expect(leaves("a")).toStrictEqual([]);
});
