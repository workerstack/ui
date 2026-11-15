import { FORM_MESSAGES_EN, type FormMessages } from "./form-messages.ts";

/** The built-in strings of `@workerstack/ui`, one per place a component shows text of its own. */
export type UiMessages = FormMessages & {
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
  /** What a control shows or announces while it loads. */
  loading: string;
  /** The name of a menu's filter field. */
  menuFilter: string;
  /** What a list or combobox shows when nothing matches. */
  noResults: string;
  /** The mark after the label of a field that is not required, e.g. “(optional)”. */
  optionalMark: string;
  /** The accessible name of a button that removes an item, such as a tag. */
  remove: string;
  /** The message of a required choice (a select, a radio group, a group of boxes) with nothing chosen. */
  requiredChoice: string;
  /** The message of a required control that has no more specific message. */
  requiredField: string;
  /** The message of a required text box that holds nothing visible. */
  requiredText: string;
  /** The message of a required checkbox or switch that is off. */
  requiredTick: string;
  /** The message of a text box over its `maxLength`; `length` is what a person sees, `max` the limit. */
  textTooLong: (length: number, max: number) => string;
  /** What a read-only view shows for a value that is empty. */
  viewEmpty: string;
  /** What a read-only view shows for `false`. */
  viewNo: string;
  /** What a read-only view shows for `true`. */
  viewYes: string;
};

/** English, the fallback for every key an app does not translate. */
export const UI_MESSAGES_EN: UiMessages = {
  ...FORM_MESSAGES_EN,
  clear: "Clear",
  close: "Close",
  comboboxCreate: (label) => `Create “${label}”`,
  comboboxCreateEmpty: "Type to create an option",
  comboboxCreateExists: (label) => `“${label}” already exists`,
  comboboxCreateNew: "Create new…",
  loading: "Loading",
  menuFilter: "Filter",
  noResults: "No results",
  optionalMark: "(optional)",
  remove: "Remove",
  requiredChoice: "Choose an option.",
  requiredField: "This is required.",
  requiredText: "Enter a value.",
  requiredTick: "Tick this box to continue.",
  textTooLong: (length, max) => `${length} of ${max} characters: shorten it.`,
  viewEmpty: "—",
  viewNo: "No",
  viewYes: "Yes",
};
