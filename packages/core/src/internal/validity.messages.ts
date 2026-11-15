/** The messages a control reports when its value is not valid. */
export type ValidityMessages = {
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
};

/** English for `ValidityMessages`. */
export const VALIDITY_MESSAGES_EN: ValidityMessages = {
  requiredChoice: "Choose an option.",
  requiredField: "This is required.",
  requiredText: "Enter a value.",
  requiredTick: "Tick this box to continue.",
  textTooLong: (length, max) => `${length} of ${max} characters: shorten it.`,
};
