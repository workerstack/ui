/** The strings of the leave confirm. */
export type LeaveConfirmMessages = {
  /** The leave confirm's button that leaves and loses the changes. */
  unsavedLeave: string;
  /** What the leave confirm says will be lost; `names` are the forms with changes. */
  unsavedLeaveDescription: (names: readonly string[]) => string;
  /** The title of the leave confirm. */
  unsavedLeaveTitle: string;
};

/** English for `LeaveConfirmMessages`. */
export const LEAVE_CONFIRM_MESSAGES_EN: LeaveConfirmMessages = {
  unsavedLeave: "Leave",
  unsavedLeaveDescription: (names) =>
    `Your changes to ${new Intl.ListFormat("en", { type: "conjunction" }).format(names)} will be lost.`,
  unsavedLeaveTitle: "Leave with unsaved changes?",
};
