import type { AnyFormApi } from "@tanstack/solid-form";
import { createContext, createSignal, onCleanup, useContext, type Context } from "solid-js";

// What a Form shares with the parts inside it, and the hooks other layers plug into: the unsaved
// layer reads the form, its name and where it starts from and hears each successful submit; a step
// guards the submit; a disclosure reveals a hidden invalid field before it is focused.

/** One value a form holds: text, numbers, flags, dates, files, and lists and groups of them. */
export type FormValue = FormScalar | readonly FormValue[] | FormValues;

/** A form value that holds no others. */
export type FormScalar = string | number | boolean | bigint | Date | Blob | null | undefined;

/** A form's values as the layers on a Form see them: the object its `defaultValues` start as. */
export type FormValues = {
  /** A field's value, or a group of them, by its key. */
  readonly [key: string]: FormValue;
};

/** Runs before a submit; `false` stops it (no validation, no attempt counted). */
export type SubmitGuard = () => boolean | Promise<boolean>;

/** Shows a hidden field (a step, a collapsed section); `true` when it changed what is shown. */
export type FormReveal = (field: HTMLElement) => boolean;

/** Hears a successful submit, with the values that were sent (now where the form starts). */
export type FormSubmitted = (values: FormValues) => void;

/** A Form as the parts inside it, and the layers on top of it, see it. */
export type FormEngine = {
  /** The form's TanStack api. */
  form: AnyFormApi;
  /** The `<form>` element, once it is in the page. */
  element: () => HTMLFormElement | undefined;
  /** The form's name for people: its `aria-label`, else its first legend or heading. */
  name: () => string | undefined;
  /** Whether the Form is read-only. */
  readOnly: () => boolean;
  /** The paths still loading (the Form's `pending`). */
  pending: () => readonly string[];
  /** Where the form starts from (reactive): its default values, then what the last save sent. */
  start: () => FormValues;
  /** Makes `values` where the form starts from; TanStack's `defaultValues` follow, so `reset` goes there. */
  setStart: (values: FormValues) => void;
  /** Whether a submit is waiting (on its guards, pending paths or a running check) before it starts. */
  waiting: () => boolean;
  /** Joins a submit guard; returns how to leave. */
  addGuard: (guard: SubmitGuard) => () => void;
  /** Joins a reveal handler; returns how to leave. */
  addReveal: (reveal: FormReveal) => () => void;
  /** Joins a listener of successful submits; returns how to leave. */
  addSubmitted: (listener: FormSubmitted) => () => void;
};

/** The enclosing Form's engine; `null` outside a Form. */
export const FORM_ENGINE_CONTEXT: Context<FormEngine | null> = /* @__PURE__ */ createContext<FormEngine | null>(null);

/** Whether a path of the enclosing Form is still loading (`Form pending`). */
export const FORM_PENDING_CONTEXT: Context<(name: string) => boolean> = /* @__PURE__ */ createContext<
  (name: string) => boolean
>(() => false);

/** The enclosing Form's engine; throws, naming `part`, outside a Form. */
export function useFormEngine(part: string): FormEngine {
  const engine = useContext(FORM_ENGINE_CONTEXT);

  if (engine === null) throw new Error(`${part} must sit inside a Form.`);

  return engine;
}

function useJoin<T>(join: (engine: FormEngine) => (entry: T) => () => void, entry: T): void {
  const engine = useContext(FORM_ENGINE_CONTEXT);

  if (engine === null) return;
  onCleanup(join(engine)(entry));
}

/**
 * Runs `guard` when the enclosing Form submits, before anything else; returning false stops the
 * submit. A multi-step form's Next is one. Does nothing outside a Form.
 */
export function useSubmitGuard(guard: SubmitGuard): void {
  useJoin((engine) => engine.addGuard, guard);
}

/** Lets a part that hides fields show the first invalid control before the Form focuses it. */
export function useFormReveal(reveal: FormReveal): void {
  useJoin((engine) => engine.addReveal, reveal);
}

/** Calls `listener` after each successful submit of the enclosing Form (a draft clears itself). */
export function useFormSubmitted(listener: FormSubmitted): void {
  useJoin((engine) => engine.addSubmitted, listener);
}

/** A set that entries join and leave. */
export type Joined<T> = {
  /** The entries now. */
  entries: () => readonly T[];
  /** Joins an entry; returns how to leave. */
  add: (entry: T) => () => void;
};

/** A set of hooks (guards, reveals, listeners) parts join while they are mounted. */
export function createJoined<T>(): Joined<T> {
  const set = new Set<T>();

  return {
    add: (entry) => {
      set.add(entry);

      return () => set.delete(entry);
    },
    entries: () => [...set],
  };
}

/** Where a form starts from, as a signal: its default values until `setStart` moves it. */
export function createStart(form: AnyFormApi): Pick<FormEngine, "setStart" | "start"> {
  const defaults = form.options.defaultValues /* TanStack's AnyFormApi types values as any */ as FormValues;
  // Written by whatever moves the start (a save, values arriving), from any scope.
  const [start, setStartSignal] = createSignal<FormValues>(defaults, { equals: false, ownedWrite: true });

  return {
    setStart: (values) => {
      form.options = { ...form.options, defaultValues: values };
      setStartSignal(() => values);
    },
    start,
  };
}

function isValidating(form: AnyFormApi): boolean {
  return form.state.isValidating || form.state.isFieldsValidating;
}

/**
 * Resolves once no validator runs (a field's async check included): TanStack ignores a submit
 * while one does. `isValidating` alone covers only the form's own validators.
 */
export function validationSettled(form: AnyFormApi): Promise<void> {
  if (!isValidating(form)) return Promise.resolve();

  return new Promise((resolve) => {
    const subscription = form.store.subscribe(() => {
      if (isValidating(form)) return;
      subscription.unsubscribe();
      resolve();
    });
  });
}
