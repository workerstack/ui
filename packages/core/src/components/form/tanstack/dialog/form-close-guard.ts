import { evaluate } from "@tanstack/solid-form";
import { onCleanup, untrack } from "solid-js";

import { useFormEngine } from "../form/form-engine.ts";
import { useFormBusy } from "../form/form-parts.tsx";

/** What an open dialog asks of its form before it may close. */
export type CloseGuard = {
  /** Whether the form's values differ from where it started. */
  changed: () => boolean;
  /** Whether the form is saving. */
  busy: () => boolean;
};

/** A guard for a dialog with no form open: nothing changed, nothing saving. */
export function idleGuard(): CloseGuard {
  return { busy: () => false, changed: () => false };
}

/**
 * Hands the dialog the enclosing Form's state. "Changed" compares the values with `engine.start()`,
 * where the form starts from (it moves on a save). TanStack's `isDirty` stays true once a field was
 * edited, even when the edit is undone, which would ask about discarding nothing.
 */
export function useCloseGuard(guard: CloseGuard): void {
  const engine = useFormEngine("FormDialog");
  const busy = useFormBusy();
  const own = untrack(() => guard);

  own.changed = () => !evaluate(engine.form.state.values, engine.start());
  own.busy = busy;
  onCleanup(() => Object.assign(own, idleGuard()));
}
