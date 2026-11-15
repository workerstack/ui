/**
 * What a Control shares with the View it turns into while read-only (the engine hands the View the
 * Control's props): plain classes and the id the Field's label points at.
 */
export type ViewSlot = {
  /** Extra classes, for the control and for its View. */
  class?: string;
  /** The element's id. Inside a Field it defaults to the id the field's label points at. */
  id?: string;
};
