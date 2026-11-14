import type { JSX } from "@solidjs/web";
import { createContext, createSignal, onSettled, useContext } from "solid-js";

import { formatLocale, type LocaleResolution, readCookie, REGION_COOKIE, regionOfTimeZone } from "../locale/index.ts";
import { UI_MESSAGES_EN, type UiMessages } from "./messages.ts";

const DEFAULT_LOCALE = "en-US";
const REGION_COOKIE_MAX_AGE = 31_536_000;

const MESSAGES_CONTEXT = /* @__PURE__ */ createContext<UiMessages>(UI_MESSAGES_EN);
const LOCALE_CONTEXT = /* @__PURE__ */ createContext<() => string>(() => DEFAULT_LOCALE);

/** What `UiProvider` takes. */
export type UiProviderProps = {
  /** The app. */
  children: JSX.Element;
  /** Translations; a missing key falls back to English. A change re-renders in place. */
  messages?: Partial<UiMessages>;
  /**
   * The BCP 47 locale dates are written and laid out in (month names, field order, first day of
   * the week, 12- or 24-hour clock): a tag, or the server's `resolveRequestLocale(request)`. With a
   * resolution that has no saved preference and no fixed region, the provider reads the browser's
   * time zone after mount: its region is written to the `ui-region` cookie, so later server renders
   * use it, and the locale follows at once.
   * @default "en-US"
   */
  locale?: string | LocaleResolution;
};

function isTag(locale: string | LocaleResolution | undefined): locale is string {
  return typeof locale === "string";
}

// The format locale: a fixed tag, or a resolution the browser's time zone may refine.
function createFormatLocale(props: UiProviderProps): () => string {
  const [refined, setRefined] = createSignal<string>();

  onSettled(() => {
    const resolution = props.locale;

    if (
      resolution === undefined ||
      isTag(resolution) ||
      resolution.preference !== undefined ||
      resolution.regionFixed === true
    )
      return;

    const region = regionOfTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    if (region === undefined) return;

    const isCookieStale = readCookie(document.cookie, REGION_COOKIE) !== region;

    if (isCookieStale)
      document.cookie = `${REGION_COOKIE}=${region}; path=/; max-age=${REGION_COOKIE_MAX_AGE}; samesite=lax`;

    if (region !== resolution.region) setRefined(formatLocale({ ...resolution, region }));
  });

  return () => {
    const resolution = props.locale;

    if (isTag(resolution)) return resolution;

    return refined() ?? resolution?.locale ?? DEFAULT_LOCALE;
  };
}

// One getter per key, so every string read tracks `messages` and a language switch re-renders in place.
function translated(source: { messages?: Partial<UiMessages> | undefined }): UiMessages {
  return {
    get clear() {
      return source.messages?.clear ?? UI_MESSAGES_EN.clear;
    },
    get close() {
      return source.messages?.close ?? UI_MESSAGES_EN.close;
    },
    get comboboxCreate() {
      return source.messages?.comboboxCreate ?? UI_MESSAGES_EN.comboboxCreate;
    },
    get comboboxCreateEmpty() {
      return source.messages?.comboboxCreateEmpty ?? UI_MESSAGES_EN.comboboxCreateEmpty;
    },
    get comboboxCreateExists() {
      return source.messages?.comboboxCreateExists ?? UI_MESSAGES_EN.comboboxCreateExists;
    },
    get comboboxCreateNew() {
      return source.messages?.comboboxCreateNew ?? UI_MESSAGES_EN.comboboxCreateNew;
    },
    get noResults() {
      return source.messages?.noResults ?? UI_MESSAGES_EN.noResults;
    },
    get remove() {
      return source.messages?.remove ?? UI_MESSAGES_EN.remove;
    },
  };
}

/**
 * Root of an app on `@workerstack/ui`: provides the translated built-in strings and the format
 * locale. Reading direction and the CSP nonce come from the page, not from here.
 */
export function UiProvider(props: UiProviderProps): JSX.Element {
  const messages = translated(props);
  const locale = createFormatLocale(props);

  return (
    <LOCALE_CONTEXT value={locale}>
      <MESSAGES_CONTEXT value={messages}>{props.children}</MESSAGES_CONTEXT>
    </LOCALE_CONTEXT>
  );
}

/** The built-in strings for the current app: translated when `UiProvider` got `messages`, else English. */
export function useUiMessages(): UiMessages {
  return useContext(MESSAGES_CONTEXT);
}

/** The app's format locale (`UiProvider locale`, refined by the time zone), else "en-US". */
export function useUiLocale(): () => string {
  return useContext(LOCALE_CONTEXT);
}
