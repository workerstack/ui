import { expect, it } from "vitest";

import { decodeDraft, encodeDraft } from "./encode-draft.ts";

const DAY = 86_400_000;
const EXPECT = { fingerprint: "f1", now: 10 * DAY, ttl: 7 * DAY };

it("encodeDraft and decodeDraft round-trip the values, Dates and lists included, with the time", () => {
  const values = { at: new Date(Date.UTC(2026, 0, 2)), name: "Ada", tags: ["a", "b"], team: { size: 3 } };
  const text = encodeDraft({ fingerprint: "f1", savedAt: 9 * DAY, values });

  expect(decodeDraft(text, EXPECT)).toStrictEqual({ fingerprint: "f1", savedAt: 9 * DAY, values });
});

it("encodeDraft leaves out what storage can't hold: undefined keys, files, big integers", () => {
  const values = { count: 1n, file: new Blob(["x"]), list: [undefined], name: "Ada", note: undefined };
  const text = encodeDraft({ fingerprint: "f1", savedAt: 9 * DAY, values });

  expect(decodeDraft(text, EXPECT)?.values).toStrictEqual({ list: [null], name: "Ada" });
});

it("decodeDraft reads nothing from another form, an expired draft or malformed text", () => {
  const text = encodeDraft({ fingerprint: "f1", savedAt: 2 * DAY, values: { name: "Ada" } });

  expect(decodeDraft(text, { ...EXPECT, fingerprint: "f2" })).toBeUndefined();
  expect(decodeDraft(text, { ...EXPECT, now: 9 * DAY + 1 })).toBeUndefined();
  expect(decodeDraft(text, { ...EXPECT, now: 9 * DAY })?.values).toStrictEqual({ name: "Ada" });
  expect(decodeDraft("{", EXPECT)).toBeUndefined();
  expect(decodeDraft(null, EXPECT)).toBeUndefined();
  const oldFormat = JSON.stringify({ fingerprint: "f1", savedAt: 9 * DAY, v: 0, values: {} });
  const noTime = JSON.stringify({ fingerprint: "f1", savedAt: "now", v: 1, values: {} });

  expect(decodeDraft(oldFormat, EXPECT)).toBeUndefined();
  expect(decodeDraft(noTime, EXPECT)).toBeUndefined();
});

it("decodeDraft reads values that are not a group as none", () => {
  const text = JSON.stringify({ fingerprint: "f1", savedAt: 9 * DAY, v: 1, values: ["a"] });

  expect(decodeDraft(text, EXPECT)?.values).toStrictEqual({});
});
