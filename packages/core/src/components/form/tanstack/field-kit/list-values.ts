import { merge } from "solid-js";

import type { ValueBindings } from "../form/bound-field-types.ts";

// The bindings hand `readOnly` as true or undefined (unset unless read-only); the list controls
// take a plain boolean under exactOptionalPropertyTypes.

/** The field's value bindings with `readOnly` as a boolean, read when the control reads it. */
export function listValues<TBindings extends ValueBindings<unknown, unknown>>(
  bound: TBindings,
): Omit<TBindings, "readOnly"> & { readonly readOnly: boolean } {
  const values = merge(bound, {
    get readOnly() {
      return bound.readOnly === true;
    },
  });

  return values /* merge's Override of a generic source, which TypeScript cannot reduce */ as Omit<
    TBindings,
    "readOnly"
  > & { readonly readOnly: boolean };
}
