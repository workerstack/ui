import { expect, it } from "vitest";

import { relativeTime } from "./relative-time.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const NOW = 100 * 24 * HOUR;

it("relativeTime says how long ago a time was, in the largest unit that fits", () => {
  expect(relativeTime(NOW - 10_000, NOW, "en-US")).toBe("now");
  expect(relativeTime(NOW - 2 * MINUTE, NOW, "en-US")).toBe("2 minutes ago");
  expect(relativeTime(NOW - 3 * HOUR, NOW, "en-US")).toBe("3 hours ago");
  expect(relativeTime(NOW - 48 * HOUR, NOW, "en-US")).toBe("2 days ago");
});

it("relativeTime reads a time after now as now", () => {
  expect(relativeTime(NOW + HOUR, NOW, "en-US")).toBe("now");
});
