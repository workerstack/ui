// The locale dates and times are formatted in, which is not the interface language: someone
// reading English in Croatia expects "05/10/2026, 14:30" and Monday-first weeks. Resolution, best
// first:
//   1. a saved preference (an account setting, or the `ui-locale` cookie), used as given;
//   2. the region, from the browser's time zone (the `ui-region` cookie the provider writes) or
//      the request's IP country (Cloudflare `request.cf.country`), combined with the language of
//      the first `Accept-Language` tag;
//   3. that language tag alone, then the app's fallback.
// For a language and region CLDR has no variant for (English in Croatia), the language's
// international form takes the region's clock and first weekday (`en-001-u-hc-h23-u-fw-mon`).

import { firstDayOfWeek, hourCycle, regionTimeZones } from "./locale-info.ts";

/** The browser's region, from its time zone (written by `UiProvider`). */
export const REGION_COOKIE = "ui-region";

/** A saved format locale for visitors without an account setting. */
export const LOCALE_COOKIE = "ui-locale";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const REGION_PATTERN = /^[A-Za-z]{2}$/;
const WEEKDAYS: readonly string[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DEFAULT_FALLBACK = "en-US";
const DEFAULT_DISPLAY_LOCALE = "en";

// Languages whose international form differs from the bare language tag.
const INTERNATIONAL_FORMS = [{ form: "en-001", language: "en" }];

const QUALITY_PREFIX = "q=";

/** The result of resolving a format locale, with what it was resolved from. */
export type LocaleResolution = {
  /** The locale to format with. */
  locale: string;
  /** The saved preference, when there is one (then nothing else counts). */
  preference?: string | undefined;
  /** The interface language (the first `Accept-Language` tag's language). */
  language?: string | undefined;
  /** The ISO 3166 region the locale was resolved for. */
  region?: string | undefined;
  /** The region came from the account (a saved country): the browser's time zone doesn't refine it. */
  regionFixed?: boolean | undefined;
};

/** What `formatLocale` resolves a locale from. */
export type FormatLocaleInput = {
  /** A saved preference, used as given when it is a valid tag. */
  preference?: string | undefined;
  /** An ISO 3166 region, from the time zone or the request's country. */
  region?: string | undefined;
  /** The interface language tag. */
  language?: string | undefined;
  /** The locale when neither a preference, a region nor a language is known. Defaults to `en-US`. */
  fallback?: string | undefined;
};

/** The parts of a request locale resolution reads; `cf` is Cloudflare's request metadata. */
export type LocaleRequest = {
  /** The request's headers: `cookie` and `accept-language` are read. */
  headers: Pick<Headers, "get">;
  /** Any object: Cloudflare's metadata is a union whose request-init member has no `country`. */
  cf?: object | null | undefined;
};

/** What `resolveRequestLocale` takes besides the request. */
export type ResolveRequestLocaleOptions = {
  /** The user's saved locale; when absent the `ui-locale` cookie is read. */
  preference?: string | undefined;
  /** The account's saved country, which outranks the detected region and stays fixed. */
  region?: string | null | undefined;
  /** The locale when nothing else is known. */
  fallback?: string | undefined;
};

/** A region Intl knows, named for a picker. */
export type RegionOption = {
  /** The ISO 3166 code. */
  code: string;
  /** The region's name in the display locale. */
  name: string;
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFilled(value: string | null | undefined): value is string {
  return value !== undefined && value !== null && value !== "";
}

// Every two-letter code, valid or not.
function regionCodeCandidates(): string[] {
  return ALPHABET.split("").flatMap((first) => ALPHABET.split("").map((second) => `${first}${second}`));
}

function compareTags(a: { index: number; q: number }, b: { index: number; q: number }): number {
  const byQuality = b.q - a.q;

  return byQuality === 0 ? a.index - b.index : byQuality;
}

/** A canonical BCP 47 tag, or undefined when `tag` isn't one. */
export function canonicalLocale(tag: string | null | undefined): string | undefined {
  if (!isFilled(tag)) return undefined;

  try {
    return Intl.getCanonicalLocales(tag)[0];
  } catch {
    return undefined;
  }
}

/** A cookie's value from a Cookie header. */
export function readCookie(header: string | null | undefined, name: string): string | undefined {
  for (const part of header?.split(";") ?? []) {
    const [key, ...value] = part.trim().split("=");

    if (key === name) return decodeURIComponent(value.join("="));
  }

  return undefined;
}

/** The most preferred valid tag of an `Accept-Language` header. */
export function firstLanguageTag(header: string | null | undefined): string | undefined {
  const tags = (header ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag = "", ...params] = entry.trim().split(";");
      const quality = params.find((param) => param.trim().startsWith(QUALITY_PREFIX));

      return {
        index,
        q: quality === undefined ? 1 : Number(quality.trim().slice(QUALITY_PREFIX.length)),
        tag: canonicalLocale(tag.trim()),
      };
    })
    .filter((entry) => isFilled(entry.tag) && entry.tag !== "*" && entry.q > 0)
    .toSorted(compareTags);

  return tags[0]?.tag;
}

/**
 * An ISO 3166 region Intl knows (it has time zones, or a name where the engine lists no zones),
 * upper-cased; undefined otherwise ("T1", "XX").
 */
export function validRegion(region: string | null | undefined): string | undefined {
  if (!isFilled(region) || !REGION_PATTERN.test(region)) return undefined;

  const upper = region.toUpperCase();
  const zones = regionTimeZones(upper);

  if (zones !== undefined) return zones.length > 0 ? upper : undefined;

  const names = new Intl.DisplayNames([DEFAULT_DISPLAY_LOCALE], { fallback: "none", type: "region" });

  return isFilled(names.of(upper)) ? upper : undefined;
}

/** The region an IANA time zone belongs to ("Europe/Zagreb" → "HR"), from Intl's own data. */
export function regionOfTimeZone(timeZone: string | null | undefined): string | undefined {
  if (!isFilled(timeZone)) return undefined;

  return regionCodeCandidates().find((code) => regionTimeZones(code)?.includes(timeZone) === true);
}

// The locale Intl formats `tag` with (it falls back when CLDR has no such variant).
function resolvedTag(tag: string): string {
  return new Intl.DateTimeFormat(tag).resolvedOptions().locale;
}

// No CLDR variant: the language's international form with the region's clock and week.
function internationalForm(base: string, region: string): string {
  const generic = INTERNATIONAL_FORMS.find((entry) => entry.language === base)?.form ?? base;
  const regionTag = new Intl.Locale(`und-${region}`).maximize().toString();
  const extensions: string[] = [];
  const clock = hourCycle(regionTag);

  if (clock !== undefined && clock !== hourCycle(generic)) extensions.push(`hc-${clock}`);

  const firstDay = firstDayOfWeek(regionTag);

  if (firstDay !== firstDayOfWeek(generic)) extensions.push(`fw-${WEEKDAYS[firstDay - 1]}`);

  return extensions.length > 0 ? `${generic}-u-${extensions.join("-")}` : generic;
}

/** The format locale for a preference, a region and a language (see the module comment). */
export function formatLocale(input: FormatLocaleInput): string {
  const preference = canonicalLocale(input.preference);

  if (preference !== undefined) return preference;

  const fallback = canonicalLocale(input.fallback) ?? DEFAULT_FALLBACK;
  const language = canonicalLocale(input.language);
  const region = validRegion(input.region);

  if (region === undefined) return language ?? fallback;

  const base = new Intl.Locale(language ?? fallback).language;
  const candidate = `${base}-${region}`;

  return resolvedTag(candidate) === candidate ? candidate : internationalForm(base, region);
}

/**
 * Resolves the format locale for a request on the server, so the server render and hydration
 * agree. `preference` is the user's saved locale (else the `ui-locale` cookie is read); `region`
 * is the account's saved country, which outranks the detected region and stays fixed.
 */
export function resolveRequestLocale(
  request: LocaleRequest,
  options: ResolveRequestLocaleOptions = {},
): LocaleResolution {
  const cookies = request.headers.get("cookie");
  const preference = canonicalLocale(options.preference ?? readCookie(cookies, LOCALE_COOKIE));
  const language = firstLanguageTag(request.headers.get("accept-language"));
  const cf = request.cf ?? undefined;
  const country = cf !== undefined && "country" in cf && isString(cf.country) ? cf.country : undefined;
  const account = validRegion(options.region);
  const region = account ?? validRegion(readCookie(cookies, REGION_COOKIE)) ?? validRegion(country);

  return {
    language,
    locale: formatLocale({ fallback: options.fallback, language, preference, region }),
    preference,
    region,
    regionFixed: account !== undefined,
  };
}

/** Every region Intl knows, named in `displayLocale` and sorted by name (a country picker). */
export function regionOptions(displayLocale: string = DEFAULT_DISPLAY_LOCALE): RegionOption[] {
  const names = new Intl.DisplayNames([displayLocale], { type: "region" });

  return regionCodeCandidates()
    .flatMap((candidate) => {
      const code = validRegion(candidate);
      const name = code === undefined ? undefined : names.of(code);

      return code !== undefined && isFilled(name) && name !== code ? [{ code, name }] : [];
    })
    .toSorted((a, b) => a.name.localeCompare(b.name, displayLocale));
}

/** Every IANA time zone Intl knows (a time-zone picker). */
export function timeZoneOptions(): string[] {
  // Older engines lack it: no list then.
  const intl: { supportedValuesOf?: (key: "timeZone") => string[] } = Intl;

  return intl.supportedValuesOf === undefined ? [] : intl.supportedValuesOf("timeZone");
}
