import { expect, it } from "vitest";

import { errorMessages, serverErrorMap, showsErrors } from "./visibility.ts";

it("showsErrors waits for the first submit attempt, then follows validity", () => {
  expect(showsErrors({ attempts: 0, isValid: false })).toBe(false);
  expect(showsErrors({ attempts: 1, isValid: false })).toBe(true);
  expect(showsErrors({ attempts: 3, isValid: true })).toBe(false);
});

it("showsErrors shows an early-revealed field's errors before any submit", () => {
  expect(showsErrors({ attempts: 0, early: true, isValid: false })).toBe(true);
  expect(showsErrors({ attempts: 0, early: true, isValid: true })).toBe(false);
});

it("errorMessages reads strings and Standard Schema issues, skipping empties and duplicates", () => {
  const results = ["Required.", { message: "Too short." }, undefined, null, "", { message: "Required." }, 42];
  const read = errorMessages(results);
  expect(read).toStrictEqual(["Required.", "Too short."]);
});

it("errorMessages flattens arrays of issues", () => {
  expect(errorMessages([[{ message: "A" }, { message: "B" }]])).toStrictEqual(["A", "B"]);
});

it("serverErrorMap maps server field errors to each field's onServer error, joined", () => {
  const map = serverErrorMap({ email: ["Taken."], name: ["Too long.", "Has digits."] });
  expect(map).toStrictEqual({ email: "Taken.", name: "Too long. Has digits." });
});

it("serverErrorMap drops fields without messages", () => {
  expect(serverErrorMap({ email: [], name: undefined })).toStrictEqual({});
});
