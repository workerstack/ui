import type { AnyFormApi } from "@tanstack/solid-form";
import { createEffect, flush, untrack } from "solid-js";

import { validationSettled, type FormSubmitted, type FormValues, type SubmitGuard } from "./form-engine.ts";

/** What a Form's submit runs through. */
export type SubmitFlow = {
  /** The form's TanStack api. */
  form: AnyFormApi;
  /** The submit guards joined now. */
  guards: () => readonly SubmitGuard[];
  /** The listeners of a successful submit joined now. */
  submitted: () => readonly FormSubmitted[];
  /** Whether a submit is waiting already. */
  waiting: () => boolean;
  /** Marks a submit as waiting, or done waiting. */
  setWaiting: (waiting: boolean) => void;
  /** Resolves once no path is pending. */
  arrived: () => Promise<void>;
  /** Makes the sent values where the form starts from. */
  setStart: (values: FormValues) => void;
  /** After a submit that failed: show the problems (the summary, or the first invalid field). */
  showProblems: () => void;
  /** After a successful submit. */
  saved: () => void;
};

/** A promise of what `pending` waits for: resolves once no path is pending. */
export function createArrivals(pending: () => readonly string[]): () => Promise<void> {
  const queue: (() => void)[] = [];

  createEffect(
    () => pending().length,
    (count) => {
      if (count > 0) return;

      for (const resolve of queue.splice(0)) resolve();
    },
  );

  return () =>
    untrack(() => pending().length) === 0 ? Promise.resolve() : new Promise<void>((resolve) => queue.push(resolve));
}

function nextTask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function passesGuards(guards: readonly SubmitGuard[]): Promise<boolean> {
  for (const guard of guards) if (!(await guard())) return false;

  return true;
}

/** Waits for pending paths, the guards and any running check; `false` when a guard stopped it. */
async function readyToSubmit(flow: SubmitFlow): Promise<boolean> {
  flow.setWaiting(true);

  try {
    await flow.arrived();

    if (!(await passesGuards(flow.guards()))) return false;
    // A check the last keystroke queued starts a task later; TanStack ignores a submit while one
    // runs, so let it start, then wait for it.
    await nextTask();
    await validationSettled(flow.form);

    return true;
  } finally {
    flow.setWaiting(false);
  }
}

function hasServerErrors(form: AnyFormApi): boolean {
  return Object.values(form.state.fieldMeta).some((meta) => meta?.errorMap.onServer !== undefined);
}

/**
 * Submits through TanStack. An invalid form (a field showing its error, or a server error the last
 * save left) makes TanStack count the attempt and stop before checking the rest; then every field
 * is checked, so every error shows.
 */
async function submitAll(form: AnyFormApi): Promise<void> {
  const isBlocked = !form.state.canSubmit || hasServerErrors(form);

  await form.handleSubmit();

  if (isBlocked) {
    await form.validateAllFields("submit");
    await form.validate("submit");
  }

  flush();
}

function settle(flow: SubmitFlow): void {
  const values = flow.form.state.values /* TanStack's AnyFormApi types values as any */ as FormValues;

  flow.setStart(values);
  flow.saved();

  for (const listener of flow.submitted()) listener(values);
}

/** A Form's submit: one at a time, after pending values, guards and running checks. */
export async function runSubmit(flow: SubmitFlow): Promise<void> {
  if (flow.form.state.isSubmitting || untrack(flow.waiting)) return;

  if (!(await readyToSubmit(flow))) return;
  await submitAll(flow.form);

  if (flow.form.state.isSubmitSuccessful && flow.form.state.isValid) settle(flow);
  else flow.showProblems();
}
