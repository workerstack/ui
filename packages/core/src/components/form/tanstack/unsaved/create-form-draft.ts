import { createEffect, createSignal, onSettled, untrack } from "solid-js";

import type { FormEngine, FormValues } from "../form/form-engine.ts";
import { createFormValues } from "./create-form-changed.ts";
import { decodeDraft, encodeDraft } from "./encode-draft.ts";
import { applyValues } from "./rebase-form.ts";
import { tryStorage } from "./try-storage.ts";

// A form's draft on this device: its changes are written to localStorage shortly after each edit
// pauses, and restored when the form mounts again, with when they were saved. A save or a discard
// deletes it; a draft from another form, or older than its time to live, is dropped. Another tab
// writing the same draft is noticed through the `storage` event.

/** How a form's draft is kept. */
export type DraftSettings = {
  /** The localStorage key: the person's scope and the form's key. */
  key: string;
  /** Milliseconds a draft is kept. */
  ttl: number;
  /** Milliseconds after the last edit before it is written. */
  delay: number;
  /** Which fields the form has (`draftFingerprint`): a draft from other fields is not restored. */
  fingerprint: string;
  /** The values a draft may keep (secrets left out). */
  keep: (values: FormValues) => FormValues;
  /** Whether the form holds unsaved changes now; without any, the draft is deleted. */
  changed: () => boolean;
  /** Whether the draft is kept now (a read-only form neither writes nor restores one). */
  active: () => boolean;
};

/** A form's draft as its parts read it. */
export type FormDraft = {
  /** When the draft was last written (none while there is no draft). */
  savedAt: () => number | undefined;
  /** When the restored draft had been saved (none unless this mount restored one). */
  restoredAt: () => number | undefined;
  /** Whether another tab wrote this draft since. */
  elsewhere: () => boolean;
  /** Whether storage can't be used: the form asks before changes are lost instead. */
  broken: () => boolean;
  /** Deletes the draft (after a save, or with a discard). */
  clear: () => void;
};

/** What the draft last wrote, and the write it is waiting to make. */
type Written = { text: string | null; content: string | null; timer?: ReturnType<typeof setTimeout> | undefined };

/** Everything the draft's steps share. */
type DraftContext = {
  engine: FormEngine;
  settings: DraftSettings;
  values: () => FormValues;
  written: Written;
  setSavedAt: (time: number | undefined) => void;
  setRestoredAt: (time: number | undefined) => void;
  setElsewhere: (isElsewhere: boolean) => void;
  setBroken: (isBroken: boolean) => void;
};

/** The draft's values without its time: unchanged content is not written again (a restore keeps its time). */
function contentOf(values: FormValues): string {
  return encodeDraft({ fingerprint: "", savedAt: 0, values });
}

function removeDraft(context: DraftContext): void {
  tryStorage((storage) => storage.removeItem(context.settings.key));
  context.written.text = null;
  context.written.content = null;
  context.setSavedAt(undefined);
}

function writeDraft(context: DraftContext): void {
  const { settings, written } = context;

  written.timer = undefined;

  if (!untrack(settings.active)) return;

  if (!untrack(settings.changed)) return removeDraft(context);

  const kept = settings.keep(untrack(context.values));
  const content = contentOf(kept);

  if (content === written.content) return;

  const savedAt = Date.now();
  const text = encodeDraft({ fingerprint: settings.fingerprint, savedAt, values: kept });

  if (!tryStorage((storage) => storage.setItem(settings.key, text))) return context.setBroken(true);

  written.text = text;
  written.content = content;
  context.setSavedAt(savedAt);
}

/** What a storage read found. */
type Read = { text: string | null };

function readDraft(context: DraftContext): string | null | undefined {
  const read: Read = { text: null };

  const isRead = tryStorage((storage) => {
    read.text = storage.getItem(context.settings.key);
  });

  return isRead ? read.text : undefined;
}

function restoreDraft(context: DraftContext): void {
  const { settings } = context;
  const text = readDraft(context);

  if (text === undefined) return context.setBroken(true);

  const draft = decodeDraft(text, { fingerprint: settings.fingerprint, now: Date.now(), ttl: settings.ttl });

  if (draft === undefined) {
    if (text !== null) tryStorage((storage) => storage.removeItem(settings.key));

    return;
  }

  // A form store write after mount, untracked as TanStack's store asks (TF-4).
  untrack(() => applyValues(context.engine.form, draft.values));
  context.written.text = text;
  context.written.content = contentOf(draft.values);
  context.setSavedAt(draft.savedAt);
  context.setRestoredAt(draft.savedAt);
}

function listenElsewhere(context: DraftContext): () => void {
  function listen(event: StorageEvent): void {
    if (event.key !== context.settings.key) return;

    // A delete (another tab saved or discarded) ends it; what this tab wrote is not another tab's.
    context.setElsewhere(event.newValue !== null && event.newValue !== context.written.text);
  }

  window.addEventListener("storage", listen);

  return () => window.removeEventListener("storage", listen);
}

function scheduleWrites(context: DraftContext): void {
  createEffect(context.values, () => {
    clearTimeout(context.written.timer);
    context.written.timer = setTimeout(() => writeDraft(context), context.settings.delay);
  });
}

/** The draft's steps' shared state, and what its parts read. */
type DraftParts = { context: DraftContext; read: Omit<FormDraft, "clear"> };

function createDraftParts(engine: FormEngine, settings: DraftSettings): DraftParts {
  // Written from timers, the storage event and the restore after mount.
  const [savedAt, setSavedAt] = createSignal<number | undefined>(undefined, { ownedWrite: true });
  const [restoredAt, setRestoredAt] = createSignal<number | undefined>(undefined, { ownedWrite: true });
  const [elsewhere, setElsewhere] = createSignal(false, { ownedWrite: true });
  const [broken, setBroken] = createSignal(false, { ownedWrite: true });
  const values = createFormValues(engine);
  const written: Written = { content: null, text: null };
  const setters = { setBroken, setElsewhere, setRestoredAt, setSavedAt };

  return {
    context: { ...setters, engine, settings, values, written },
    read: { broken, elsewhere, restoredAt, savedAt },
  };
}

/** The draft of the Form `engine` belongs to, kept per `settings`. Call it in a component's body. */
export function createFormDraft(engine: FormEngine, settings: DraftSettings): FormDraft {
  const { context, read } = createDraftParts(engine, settings);

  onSettled(() => {
    if (untrack(settings.active)) restoreDraft(context);

    const stop = listenElsewhere(context);

    return () => {
      clearTimeout(context.written.timer);
      stop();
    };
  });
  scheduleWrites(context);

  function clear(): void {
    clearTimeout(context.written.timer);
    removeDraft(context);
    context.setRestoredAt(undefined);
    context.setElsewhere(false);
  }

  return { ...read, clear };
}
