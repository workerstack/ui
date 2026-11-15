import { deleteBy, useStore } from "@tanstack/solid-form";
import { createMemo } from "solid-js";

import type { FormEngine, FormValues } from "../form-engine.ts";
import { valuesChanged } from "./values-changed.ts";

/** What a form's values read now, as its TanStack store holds them. */
export function createFormValues(engine: FormEngine): () => FormValues {
  return useStore(
    engine.form.store,
    (state): FormValues => state.values /* AnyFormApi types values as any; they are the form's object */ as FormValues,
  );
}

function withoutPending(values: FormValues, pending: readonly string[]): FormValues {
  let rest = values;

  for (const path of pending) rest = deleteBy(rest, path) /* deleteBy returns any: a copy */ as FormValues;

  return rest;
}

/**
 * Whether the Form holds unsaved changes: its values differ from where it starts (a revert is no
 * change). Paths still pending have not arrived, so they are no change yet; a read-only form has none.
 */
export function createFormChanged(engine: FormEngine): () => boolean {
  const values = createFormValues(engine);

  return createMemo(() => {
    if (engine.readOnly()) return false;

    const pending = engine.pending();

    return valuesChanged(withoutPending(engine.start(), pending), withoutPending(values(), pending));
  });
}
