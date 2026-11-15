import { describe, expect, it } from "vitest";

import { dropDuration } from "./drop-duration.ts";

describe("dropDuration", () => {
  it("rises from 250ms to 400ms over 1500px", () => {
    expect(dropDuration(0, "drop")).toBe(250);
    expect(dropDuration(750, "drop")).toBe(325);
    expect(dropDuration(1500, "drop")).toBe(400);
    expect(dropDuration(4000, "drop")).toBe(400);
  });

  it("is 0.6 times as long for a cancel", () => {
    expect(dropDuration(0, "cancel")).toBe(150);
    expect(dropDuration(1500, "cancel")).toBe(240);
  });
});
