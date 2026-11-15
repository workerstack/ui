import type { JSX } from "@solidjs/web";
import { createContext, createMemo, createSignal, onSettled, untrack, useContext } from "solid-js";

import { createLeaveAsk, LeaveConfirm } from "./leave-confirm.tsx";

// Unsaved changes across a page. Each FormUnsaved registers here with its name, whether it is
// changed and its policy; leaving asks about the changed `confirm` forms. `draft` forms keep their
// changes on the device, so they never block leaving. Without a provider, registering does nothing.

/** What a form does about changes it has not saved: ask before they are lost, or keep a draft. */
export type UnsavedPolicy = "confirm" | "draft";

/** A part of the page that can hold unsaved changes. */
export type UnsavedEntry = {
  /** Its name for people, in the leave confirm. */
  label: () => string;
  /** Whether it holds unsaved changes now. */
  changed: () => boolean;
  /** What it does about them. */
  policy: () => UnsavedPolicy;
};

/** The page's registry. */
type UnsavedRegistry = {
  register: (entry: UnsavedEntry) => () => void;
  changed: () => readonly string[];
  confirmLeave: () => Promise<boolean>;
  scope: () => string | undefined;
};

const UNSAVED_CONTEXT = /* @__PURE__ */ createContext<UnsavedRegistry | null>(null);

/** What `UnsavedChangesProvider` takes. */
export type UnsavedChangesProviderProps = {
  /** Whose drafts these are (the signed-in user), so one device keeps each person's drafts apart. */
  scope?: string;
  /** The app, or the part of it whose forms count. */
  children?: JSX.Element;
};

/** Raises the browser's prompt on closing or reloading the tab while anything would be lost. */
function unloadWarning(changed: () => readonly string[]): (event: BeforeUnloadEvent) => void {
  return (event) => {
    if (untrack(changed).length > 0) event.preventDefault();
  };
}

function warnBeforeUnload(changed: () => readonly string[]): void {
  onSettled(() => {
    const warn = unloadWarning(changed);

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  });
}

function changedConfirms(entries: readonly UnsavedEntry[]): string[] {
  return entries.filter((entry) => entry.policy() === "confirm" && entry.changed()).map((entry) => entry.label());
}

/**
 * The page's registry of unsaved changes. Closing or reloading the tab while a `confirm` form is
 * changed raises the browser's prompt; an app's router asks first through `useConfirmLeave`. Mount
 * it once, inside UiProvider, around the app.
 */
export function UnsavedChangesProvider(props: UnsavedChangesProviderProps): JSX.Element {
  // Forms register after they mount and leave as they unmount.
  const [entries, setEntries] = createSignal<readonly UnsavedEntry[]>([], { ownedWrite: true });
  const changed = createMemo(() => changedConfirms(entries()));
  const ask = createLeaveAsk();

  warnBeforeUnload(changed);

  const registry: UnsavedRegistry = {
    changed,
    confirmLeave: () => {
      const names = untrack(changed);

      return names.length === 0 ? Promise.resolve(true) : ask.ask(names);
    },
    register: (entry) => {
      setEntries((list) => [...list, entry]);

      return () => setEntries((list) => list.filter((item) => item !== entry));
    },
    scope: () => props.scope,
  };

  return (
    <UNSAVED_CONTEXT value={registry}>
      {props.children}
      <LeaveConfirm ask={ask} />
    </UNSAVED_CONTEXT>
  );
}

/** Registers `entry` with the page once the calling component is mounted, until it unmounts. */
export function useRegisterUnsaved(entry: UnsavedEntry): void {
  const registry = useContext(UNSAVED_CONTEXT);

  if (registry === null) return;

  // After mount: a server render writes no signal, and the server has no page to leave.
  onSettled(() => registry.register(entry));
}

/** The names of the page's changed `confirm` forms: what leaving now would lose. */
export function useUnsavedChanges(): () => readonly string[] {
  const registry = useContext(UNSAVED_CONTEXT);

  return () => registry?.changed() ?? [];
}

/**
 * How an app's router asks before leaving: resolves `true` at once when nothing would be lost,
 * else opens a dialog naming the changed forms and resolves `true` on Leave, `false` on Stay.
 *
 *     const confirmLeave = useConfirmLeave();
 *     useBeforeLeave(async (event) => {
 *       if (event.defaultPrevented) return;
 *       event.preventDefault();
 *       if (await confirmLeave()) event.retry(true);
 *     });
 */
export function useConfirmLeave(): () => Promise<boolean> {
  const registry = useContext(UNSAVED_CONTEXT);

  return () => registry?.confirmLeave() ?? Promise.resolve(true);
}

/** Whose drafts these are, from the provider (`undefined` without one). */
export function useDraftScope(): () => string | undefined {
  const registry = useContext(UNSAVED_CONTEXT);

  return () => registry?.scope();
}
