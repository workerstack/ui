import { expect, it } from "vitest";

import {
  firstLanguageTag,
  formatLocale,
  readCookie,
  regionOfTimeZone,
  regionOptions,
  resolveRequestLocale,
  validRegion,
} from "./index.ts";

const SAMPLE_DATE = new Date(2026, 9, 5, 14, 30);
const CROATIAN_SAMPLE = "05/10/2026, 14:30";

function request(headers: Record<string, string>, country?: string) {
  return {
    cf: country === undefined ? undefined : { country },
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  };
}

function sample(locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(SAMPLE_DATE);
}

it("formatLocale: a saved preference wins over everything", () => {
  expect(formatLocale({ language: "en-US", preference: "hr-HR", region: "US" })).toBe("hr-HR");
  expect(formatLocale({ preference: "en-US-u-hc-h23", region: "HR" })).toBe("en-US-u-hc-h23");
});

it("formatLocale: English in Croatia gets English names, day-first dates and a 24-hour clock", () => {
  const locale = formatLocale({ language: "en-US", region: "HR" });

  expect(sample(locale)).toBe(CROATIAN_SAMPLE);
  expect(new Intl.Locale(locale).language).toBe("en");
});

it("formatLocale: uses CLDR's own variant when the language has one for the region", () => {
  expect(formatLocale({ language: "en-US", region: "GB" })).toBe("en-GB");
  expect(formatLocale({ language: "en", region: "DE" })).toBe("en-DE");
  expect(formatLocale({ language: "hr", region: "HR" })).toBe("hr-HR");
  expect(formatLocale({ language: "en-GB", region: "US" })).toBe("en-US");
});

it("formatLocale: without a region it is the language tag, without either the fallback", () => {
  expect(formatLocale({ language: "en-GB" })).toBe("en-GB");
  expect(formatLocale({})).toBe("en-US");
  expect(formatLocale({ fallback: "de-DE" })).toBe("de-DE");
  expect(formatLocale({ language: "en-US", region: "T1" })).toBe("en-US");
});

it("firstLanguageTag reads the most preferred Accept-Language tag", () => {
  expect(firstLanguageTag("en-US,en;q=0.9")).toBe("en-US");
  expect(firstLanguageTag("hr;q=0.5, en-GB;q=0.8, *;q=0.1")).toBe("en-GB");
  expect(firstLanguageTag("")).toBeUndefined();
});

it("regionOfTimeZone maps a time zone to its region from Intl's data", () => {
  expect(regionOfTimeZone("Europe/Zagreb")).toBe("HR");
  expect(regionOfTimeZone("America/New_York")).toBe("US");
  expect(regionOfTimeZone("Nowhere/City")).toBeUndefined();
});

it("validRegion accepts only regions Intl knows", () => {
  expect(validRegion("hr")).toBe("HR");
  expect(validRegion("T1")).toBeUndefined();
  expect(validRegion("ZZ")).toBeUndefined();
});

it("readCookie reads a cookie from a Cookie header", () => {
  expect(readCookie("a=1; ui-region=HR; b=2", "ui-region")).toBe("HR");
  expect(readCookie(null, "ui-region")).toBeUndefined();
});

it("regionOptions lists named regions sorted by name", () => {
  const options = regionOptions("en");
  const names = options.map((option) => option.name);

  expect(options.find((option) => option.code === "HR")?.name).toBe("Croatia");
  expect(options.some((option) => option.code === "T1" || option.code === "ZZ")).toBe(false);
  expect(names).toStrictEqual(names.toSorted((a, b) => a.localeCompare(b, "en")));
});

it("resolveRequestLocale: an English browser in Croatia (IP country) formats day-first and 24-hour", () => {
  const resolved = resolveRequestLocale(request({ "accept-language": "en-US,en;q=0.9" }, "HR"));

  expect(resolved.region).toBe("HR");
  expect(sample(resolved.locale)).toBe(CROATIAN_SAMPLE);
});

it("resolveRequestLocale: the time-zone region cookie outranks the IP country (a VPN, a trip)", () => {
  const resolved = resolveRequestLocale(request({ "accept-language": "en-US", cookie: "ui-region=US" }, "HR"));

  expect(resolved.locale).toBe("en-US");
});

it("resolveRequestLocale: a saved preference (argument or cookie) wins", () => {
  const cookie = request({ cookie: "ui-locale=hr-HR" }, "US");

  expect(resolveRequestLocale(cookie).locale).toBe("hr-HR");
  expect(resolveRequestLocale(cookie, { preference: "de-DE" }).locale).toBe("de-DE");
});

it("resolveRequestLocale: an account country outranks the time zone and the IP, and stays fixed", () => {
  const resolved = resolveRequestLocale(request({ "accept-language": "en-US", cookie: "ui-region=US" }, "US"), {
    region: "HR",
  });

  expect(resolved.region).toBe("HR");
  expect(resolved.regionFixed).toBe(true);
  expect(sample(resolved.locale)).toBe(CROATIAN_SAMPLE);
  expect(resolveRequestLocale(request({}, "HR"), { region: null }).regionFixed).toBe(false);
});

it("resolveRequestLocale: with nothing known it is the language tag, then the fallback", () => {
  expect(resolveRequestLocale(request({ "accept-language": "en-GB" })).locale).toBe("en-GB");
  expect(resolveRequestLocale(request({}), { fallback: "en-US" }).locale).toBe("en-US");
});
