/** The strings of a combobox's create row. */
export type ComboboxCreateMessages = {
  /** A combobox row that creates the typed label, e.g. “Create “Design””. */
  comboboxCreate: (label: string) => string;
  /** A combobox's create row with no query: creating is disabled. */
  comboboxCreateEmpty: string;
  /** A combobox's create row when the typed label is already an option. */
  comboboxCreateExists: (label: string) => string;
};

/** English for `ComboboxCreateMessages`. */
export const COMBOBOX_CREATE_MESSAGES_EN: ComboboxCreateMessages = {
  comboboxCreate: (label) => `Create “${label}”`,
  comboboxCreateEmpty: "Type to create an option",
  comboboxCreateExists: (label) => `“${label}” already exists`,
};
