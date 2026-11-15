import { expect, it } from "vitest";

import { draftFingerprint, omitPaths } from "./draft-fingerprint.ts";

it("draftFingerprint changes with the form's paths, not with their values", () => {
  const fingerprint = draftFingerprint({ address: { city: "Oslo" }, name: "Ada" });

  expect(draftFingerprint({ address: { city: "" }, name: "Grace" })).toBe(fingerprint);
  expect(draftFingerprint({ address: { city: "Oslo" }, name: "Ada", phone: "" })).not.toBe(fingerprint);
  expect(draftFingerprint({ address: "Oslo", name: "Ada" })).not.toBe(fingerprint);
});

it("omitPaths leaves out the paths a draft may not keep, in groups and every item of a list", () => {
  const values = {
    cards: [
      { label: "Work", number: "4111" },
      { label: "Home", number: "5500" },
    ],
    name: "Ada",
    password: "secret",
  };

  expect(omitPaths(values, ["password", "cards[*].number"])).toStrictEqual({
    cards: [{ label: "Work" }, { label: "Home" }],
    name: "Ada",
  });
  expect(omitPaths(values, ["cards[1].number", "missing.path"])).toStrictEqual({
    cards: [{ label: "Work", number: "4111" }, { label: "Home" }],
    name: "Ada",
    password: "secret",
  });
});
