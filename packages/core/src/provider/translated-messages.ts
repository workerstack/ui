import { UI_MESSAGES_EN, type UiMessages } from "./messages.ts";

/** Whether `key` names one of the built-in strings. */
function isMessageKey(key: string | symbol): key is keyof UiMessages {
  return typeof key === "string" && Object.hasOwn(UI_MESSAGES_EN, key);
}

/**
 * The built-in strings with `messages` over English. Each read looks `messages()` up again, so a
 * read inside a component tracks it and a language switch re-renders in place.
 */
export function translatedMessages(messages: () => Partial<UiMessages> | undefined): UiMessages {
  return new Proxy(UI_MESSAGES_EN, {
    // A key that is not a string (a symbol, `then`) reads as null, so the strings are never thenable.
    get: (english, key) => (isMessageKey(key) ? (messages()?.[key] ?? english[key]) : null),
  });
}
