import { getBy, setBy, type AnyFormApi } from "@tanstack/solid-form";
import { untrack } from "solid-js";

import type { FormEngine, FormValue, FormValues } from "../form-engine.ts";
import { leaves, valuesChanged } from "./values-changed.ts";

// Moving where a form starts. `rebaseForm` makes values that arrive (a record loaded after the form
// mounted, what a save returned) the new start, path by path: a path the person has not edited
// takes the new value, an edited one keeps theirs. Field state (touched, errors) stays: TanStack's
// own `reset` replaces every value and clears every field, so it is not used.

/** How `rebaseForm` treats the person's edits. */
export type RebaseOptions = {
  /** Keep the person's value where they edited a path; `false` replaces it too. @default true */
  keepEdited?: boolean;
};

/** Writes a value as the form's own, leaving field state alone. */
function write(form: AnyFormApi, leaf: readonly [string, FormValue]): void {
  form.setFieldValue(leaf[0], leaf[1], { dontRunListeners: true, dontUpdateMeta: true, dontValidate: true });
}

function editedAt(form: AnyFormApi, start: FormValues, path: string): boolean {
  const before = getBy(start, path) /* getBy returns any: the value at a path of form values */ as FormValue;
  const current = getBy(form.state.values, path) /* the same, in the values now */ as FormValue;

  return valuesChanged(before, current);
}

/**
 * Makes `values` (all of a form's values or some paths of them) where the form starts from. Call it
 * from an event or wrap it in `untrack` inside an effect (TanStack's store warns otherwise).
 */
export function rebaseForm(engine: FormEngine, values: FormValues, options: RebaseOptions = {}): void {
  const keepEdited = options.keepEdited ?? true;
  let start = untrack(engine.start);

  for (const leaf of leaves(values)) {
    const isEdited = keepEdited && editedAt(engine.form, start, leaf[0]);

    start = setBy(start, leaf[0], leaf[1]) /* TanStack's setBy returns any */ as FormValues;

    if (!isEdited) write(engine.form, leaf);
  }

  engine.setStart(start);
}

/** Writes `values` as the person's own, without moving where the form starts (a restored draft). */
export function applyValues(form: AnyFormApi, values: FormValues): void {
  for (const leaf of leaves(values)) write(form, leaf);
}

/** Puts the form back where it starts from: its values and field state as when it mounted. */
export function discardChanges(engine: FormEngine): void {
  engine.form.reset(untrack(engine.start), { keepDefaultValues: true });
}
