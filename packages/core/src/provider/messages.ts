/** The built-in strings of `@workerstack/ui`, one per place a component shows text of its own. */
export type UiMessages = {
  /** The accessible name of an input's clear button. */
  clear: string;
  /** The accessible name of a dialog's corner close button. */
  close: string;
};

/** English, the fallback for every key an app does not translate. */
export const UI_MESSAGES_EN: UiMessages = {
  clear: "Clear",
  close: "Close",
};
