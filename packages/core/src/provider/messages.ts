/** The built-in strings of `@workerstack/ui`, one per place a component shows text of its own. */
export type UiMessages = {
  /** The accessible name of an input's clear button. */
  clear: string;
  /** The accessible name of a dialog's corner close button. */
  close: string;
  /** A combobox row that creates the typed label, e.g. “Create “Design””. */
  comboboxCreate: (label: string) => string;
  /** A combobox's create row with no query: creating is disabled, or a create flow follows. */
  comboboxCreateEmpty: string;
  /** A combobox's create row when the typed label is already an option. */
  comboboxCreateExists: (label: string) => string;
  /** A combobox's create row that starts a create flow. */
  comboboxCreateNew: string;
  /** What a list or combobox shows when nothing matches. */
  noResults: string;
  /** The accessible name of a button that removes an item, such as a tag. */
  remove: string;
};

/** English, the fallback for every key an app does not translate. */
export const UI_MESSAGES_EN: UiMessages = {
  clear: "Clear",
  close: "Close",
  comboboxCreate: (label) => `Create “${label}”`,
  comboboxCreateEmpty: "Type to create an option",
  comboboxCreateExists: (label) => `“${label}” already exists`,
  comboboxCreateNew: "Create new…",
  noResults: "No results",
  remove: "Remove",
};
