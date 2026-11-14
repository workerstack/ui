import { expect, it } from "vitest";

import { ADA, LANGUAGES, PLANS, STATUSES } from "./__fixtures__/option-items.fixture.ts";
import { optionColor, optionEntries, optionLabel, optionLabels } from "./option-items.ts";

it("looks a value up in a list of strings, items, or groups", () => {
  expect(optionLabel(LANGUAGES, "Rust")).toBe("Rust");
  expect(optionLabel(PLANS, "pro")).toBe("Pro plan");
  expect(optionLabel(STATUSES, "ready")).toBe("Ready");
  expect(optionLabel(STATUSES, "Shipped")).toBe("Shipped");
});

it("falls back to the value itself, a custom label, or nothing for an empty value", () => {
  expect(optionLabel(PLANS, "owner")).toBe("owner");
  expect(optionLabel(undefined, "owner")).toBe("owner");
  expect(optionLabel<typeof ADA>([], ADA, (person) => person.name)).toBe("Ada");
  expect(optionLabel(PLANS, null)).toBe("");
  expect(optionLabel(PLANS, "")).toBe("");
});

it("labels several values in order", () => {
  expect(optionLabels(STATUSES, ["ready", "backlog"])).toStrictEqual(["Ready", "Backlog"]);
});

it("lists the options as flat items, in order, without separators", () => {
  expect(optionEntries(LANGUAGES)).toStrictEqual([
    { label: "Go", value: "Go" },
    { label: "Rust", value: "Rust" },
  ]);
  expect(optionEntries(PLANS)).toStrictEqual([{ description: "Monthly", label: "Pro plan", value: "pro" }]);
  expect(optionEntries(STATUSES).map((entry) => entry.value)).toStrictEqual([
    "backlog",
    "unsorted",
    "review",
    "ready",
    "Shipped",
  ]);
  expect(optionEntries(undefined)).toStrictEqual([]);
});

it("keeps an item's color", () => {
  expect(optionEntries(STATUSES)[0]).toStrictEqual({ color: "neutral", label: "Backlog", value: "backlog" });
});

it("reads a value's color, and none for plain options or unknown values", () => {
  expect(optionColor(STATUSES, "ready")).toBe("chart-2");
  expect(optionColor(STATUSES, "unsorted")).toBeUndefined();
  expect(optionColor(STATUSES, "missing")).toBeUndefined();
  expect(optionColor(LANGUAGES, "Go")).toBeUndefined();
  expect(optionColor(STATUSES, null)).toBeUndefined();
});
