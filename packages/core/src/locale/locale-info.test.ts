import { expect, it } from "vitest";

import { firstDayOfWeek, hourCycle, regionTimeZones, textDirection, validRegion } from "./index.ts";

type InfoMethod = "getTextInfo" | "getTimeZones" | "getWeekInfo";

// Runs `check` as on an engine without one of the `Intl.Locale` info methods.
function withoutLocaleMethod(name: InfoMethod, check: () => void) {
  const proto = Intl.Locale.prototype /* the lib types the prototype as any; it is an object */ as object;
  const saved = Object.getOwnPropertyDescriptor(proto, name);

  Reflect.deleteProperty(proto, name);

  try {
    check();
  } finally {
    if (saved !== undefined) Object.defineProperty(proto, name, saved);
  }
}

function expectWeeks() {
  expect(firstDayOfWeek("en-US")).toBe(7);
  expect(firstDayOfWeek("ar-EG")).toBe(6);
  expect(firstDayOfWeek("fr-FR")).toBe(1);
}

function expectDirections() {
  expect(textDirection("ar-EG")).toBe("rtl");
  expect(textDirection("he")).toBe("rtl");
  expect(textDirection("en-US")).toBe("ltr");
}

it("firstDayOfWeek reads the week's first day, falling back to CLDR's regions", () => {
  expectWeeks();
  withoutLocaleMethod("getWeekInfo", expectWeeks);
});

it("textDirection reads the script direction, falling back to the right-to-left languages", () => {
  expectDirections();
  withoutLocaleMethod("getTextInfo", expectDirections);
});

it("hourCycle reads the clock from the locale's formatting", () => {
  expect(hourCycle("en-US")).toBe("h12");
  expect(hourCycle("hr-HR")).toBe("h23");
});

it("regionTimeZones lists a region's time zones, or says the engine can't", () => {
  expect(regionTimeZones("HR")).toContain("Europe/Zagreb");
  withoutLocaleMethod("getTimeZones", () => {
    expect(regionTimeZones("HR")).toBeUndefined();
  });
});

it("validRegion validates by zones, or by name where the engine lists none", () => {
  expect(validRegion("hr")).toBe("HR");
  expect(validRegion("XX")).toBeUndefined();
  withoutLocaleMethod("getTimeZones", () => {
    expect(validRegion("hr")).toBe("HR");
    expect(validRegion("XX")).toBeUndefined();
  });
});
