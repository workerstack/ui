import type { AnyFieldApi, DeepKeys, DeepValue } from "@tanstack/solid-form";
import { createContext, useContext, type Context } from "solid-js";

import type { Sortable } from "../../dnd/sortable/core/index.ts";

// What a form array's Root shares with its parts, and the Items' sortable its Handles bind to.

/** The paths of the form's values that hold arrays. */
export type ArrayKeys<TFormData> = {
  [K in DeepKeys<TFormData>]: DeepValue<TFormData, K> extends readonly unknown[] ? K : never;
}[DeepKeys<TFormData>];

/** A form array as its parts see it. */
export type FormArrayState = {
  /** The TanStack array field. */
  field: () => AnyFieldApi;
  /** The id of the array's error, which describes the group while it shows. */
  errorId: string;
  /** How many items the array holds now: tracked, and current in the same task as a write. */
  length: () => number;
  /** Remove disables at this many items. */
  min: () => number;
  /** Add disables at this many items. */
  max: () => number;
  /** Whether the array's own errors show. */
  invalid: () => boolean;
  /** The array's own error messages. */
  messages: () => string[];
  /** Whether the Form is read-only: the parts that edit the array render nothing. */
  readOnly: () => boolean;
  /** Focuses the item at `index` once the DOM has it: an enabled button of `parts`, else its first control. */
  focusItem: (index: number, parts?: readonly string[]) => void;
};

/** The enclosing Root's array; null outside one. */
export const FORM_ARRAY_CONTEXT: Context<FormArrayState | null> = /* @__PURE__ */ createContext<FormArrayState | null>(
  null,
);

/** The Items' sortable, for its Handles; null outside Items. */
export const FORM_ARRAY_ITEMS_CONTEXT: Context<Sortable | null> = /* @__PURE__ */ createContext<Sortable | null>(null);

/** The enclosing Root's array; throws, naming `part`, outside a Root. */
export function useFormArray(part: string): FormArrayState {
  const array = useContext(FORM_ARRAY_CONTEXT);

  if (array === null) throw new Error(`formArray.${part} must sit inside formArray.Root.`);

  return array;
}

/** The enclosing Items' sortable; throws outside Items. */
export function useFormArrayItems(): Sortable {
  const sortable = useContext(FORM_ARRAY_ITEMS_CONTEXT);

  if (sortable === null) throw new Error("FormArray.Handle must sit inside formArray.Items.");

  return sortable;
}
