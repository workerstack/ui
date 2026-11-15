// A locale's week start, clock and script direction, and a region's time zones, from Intl. The
// `Intl.Locale` info methods (`getWeekInfo`, `getTextInfo`, `getTimeZones`) are recent (Chrome
// 130), so where an engine lacks one the answer comes from another standard API or CLDR's lists.

/** A locale's script direction. */
export type TextDirection = "ltr" | "rtl";

/** `Intl.Locale` with the recent info methods, which the TypeScript lib does not declare yet. */
type InfoLocale = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number };
  getTextInfo?: () => { direction: TextDirection };
  getTimeZones?: () => string[] | undefined;
};

const MONDAY = 1;
const SATURDAY = 6;
const SUNDAY = 7;

// CLDR's regions whose weeks start on Sunday or Saturday; the rest start on Monday.
const SUNDAY_START_REGIONS: readonly string[] = [
  "AG",
  "AS",
  "BD",
  "BR",
  "BS",
  "BT",
  "BW",
  "BZ",
  "CA",
  "CN",
  "CO",
  "DM",
  "DO",
  "ET",
  "GT",
  "GU",
  "HK",
  "HN",
  "ID",
  "IL",
  "IN",
  "JM",
  "JP",
  "KE",
  "KH",
  "KR",
  "LA",
  "MH",
  "MM",
  "MO",
  "MT",
  "MX",
  "MZ",
  "NI",
  "NP",
  "PA",
  "PE",
  "PH",
  "PK",
  "PR",
  "PT",
  "PY",
  "SA",
  "SG",
  "SV",
  "TH",
  "TT",
  "TW",
  "UM",
  "US",
  "VE",
  "VI",
  "WS",
  "YE",
  "ZA",
  "ZW",
];

const SATURDAY_START_REGIONS: readonly string[] = [
  "AE",
  "AF",
  "BH",
  "DJ",
  "DZ",
  "EG",
  "IQ",
  "IR",
  "JO",
  "KW",
  "LY",
  "OM",
  "QA",
  "SD",
  "SY",
];

// Languages written right to left.
const RTL_LANGUAGES: readonly string[] = ["ar", "ckb", "dv", "fa", "he", "ks", "ku", "ps", "sd", "ug", "ur", "yi"];

function infoLocale(locale: string): InfoLocale {
  return new Intl.Locale(locale);
}

/** The locale's first day of the week: 1 (Monday) to 7 (Sunday). */
export function firstDayOfWeek(locale: string): number {
  const tag = infoLocale(locale);

  if (tag.getWeekInfo !== undefined) return tag.getWeekInfo().firstDay;

  const region = tag.maximize().region ?? "";

  if (SUNDAY_START_REGIONS.includes(region)) return SUNDAY;

  if (SATURDAY_START_REGIONS.includes(region)) return SATURDAY;

  return MONDAY;
}

/** The locale's script direction. */
export function textDirection(locale: string): TextDirection {
  const tag = infoLocale(locale);

  if (tag.getTextInfo !== undefined) return tag.getTextInfo().direction;

  return RTL_LANGUAGES.includes(tag.language) ? "rtl" : "ltr";
}

/** The locale's clock: `h12`, `h23` and the rarer `h11` and `h24`. */
export function hourCycle(locale: string): Intl.DateTimeFormatOptions["hourCycle"] {
  return new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
}

/**
 * A region's IANA time zones (none for a code that is no country); undefined where the engine
 * can't list them.
 */
export function regionTimeZones(region: string): readonly string[] | undefined {
  const tag = infoLocale(`und-${region}`);

  if (tag.getTimeZones === undefined) return undefined;

  return tag.getTimeZones() ?? [];
}
