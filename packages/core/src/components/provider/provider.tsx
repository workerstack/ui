import type { JSX } from "@solidjs/web";
import { createContext, createSignal, onSettled, useContext } from "solid-js";

import {
  formatLocale,
  type LocaleResolution,
  readCookie,
  REGION_COOKIE,
  regionOfTimeZone,
} from "../../utils/locale/index.ts";
import { UI_MESSAGES_EN, type UiMessages } from "./messages.ts";
import { translatedMessages } from "./translated-messages.ts";

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

type FocusSource = "keyboard" | "pointer";

function setFocusSource(source: FocusSource): void {
  const root = document.documentElement;

  if (root.dataset["focusSource"] !== source) root.dataset["focusSource"] = source;
}

function onPointerDown(): void {
  setFocusSource("pointer");
}

function onKeyDown(): void {
  setFocusSource("keyboard");
}

// Whether the last input was the pointer or the keyboard, on <html data-focus-source>: a read-only
// field rings only from the keyboard (theme.css). Set after mount, removed on dispose.
function trackFocusSource(): void {
  onSettled(() => {
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      delete document.documentElement.dataset["focusSource"];
    };
  });
}

/**
 * Root of an app on `@workerstack/ui`: provides the translated built-in strings and the format
 * locale, and keeps `data-focus-source` ("keyboard" or "pointer") on `<html>` for the theme.
 * Reading direction and the CSP nonce come from the page, not from here.
 */
export function UiProvider(props: UiProviderProps): JSX.Element {
  const messages = translatedMessages(() => props.messages);
  const locale = createFormatLocale(props);

  trackFocusSource();

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
