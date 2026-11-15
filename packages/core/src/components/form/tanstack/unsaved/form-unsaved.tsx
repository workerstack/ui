import type { JSX } from "@solidjs/web";
import { createContext, untrack, useContext } from "solid-js";

import { useUiMessages } from "../../../provider/index.ts";
import { useFormEngine, useFormSubmitted, type FormEngine } from "../form/form-engine.ts";
import { createFormChanged } from "./create-form-changed.ts";
import { createFormDraft, type FormDraft } from "./create-form-draft.ts";
import { draftFingerprint, omitPaths } from "./draft-fingerprint.ts";
import { FORM_UNSAVED_MESSAGES_EN } from "./form-unsaved.messages.ts";
import { discardChanges } from "./rebase-form.ts";
import { useDraftScope, useRegisterUnsaved, type UnsavedPolicy } from "./unsaved-changes-provider.tsx";

/** Drafts are kept seven days unless a form says otherwise. */
// A week, in milliseconds.
const DEFAULT_TTL = 604_800_000;

/** Milliseconds after the last edit before a draft is written. */
const DEFAULT_DELAY = 500;

/** What draft keys start with in localStorage. */
const PREFIX = "ui-draft";

/** A Form's unsaved state, as FormUnsavedStatus, FormDraftNotice and FormSaveBar read it. */
export type FormUnsavedState = {
  /** Whether the form holds unsaved changes. */
  changed: () => boolean;
  /** What the form does about them now (a draft that can't be kept asks instead). */
  policy: () => UnsavedPolicy;
  /** The form's name in the leave confirm. */
  label: () => string;
  /** Puts the form back where it starts from and deletes its draft. */
  discard: () => void;
  /** The form's draft, when it keeps one. */
  draft: FormDraft | undefined;
};

const FORM_UNSAVED_CONTEXT = /* @__PURE__ */ createContext<FormUnsavedState | null>(null);

/** The enclosing FormUnsaved's state; throws, naming `part`, outside one. */
export function useFormUnsaved(part: string): FormUnsavedState {
  const state = useContext(FORM_UNSAVED_CONTEXT);

  if (state === null) throw new Error(`${part} must sit inside FormUnsaved.`);

  return state;
}

/** What `FormUnsaved` takes. */
export type FormUnsavedProps = {
  /** The form's name where unsaved changes are listed. @default the Form's name, else "this form" */
  label?: string;
  /** Keeps the changes on this device as a draft under this key (the record and its form: `invoice:42`). */
  draftKey?: string;
  /** Milliseconds a draft is kept. @default 7 days */
  draftTtl?: number;
  /** Milliseconds after the last edit before the draft is written. @default 500 */
  draftDelay?: number;
  /** Paths a draft never keeps: secrets such as `"password"` or `"cards[*].number"`. */
  draftOmit?: readonly string[];
  /** Which version of the form wrote a draft. @default a fingerprint of the paths of its values */
  draftFingerprint?: string;
  /** The Form's content: its fields and the parts that show unsaved changes. */
  children?: JSX.Element;
};

function createDraft(engine: FormEngine, props: FormUnsavedProps, changed: () => boolean): FormDraft | undefined {
  const scope = useDraftScope();
  const key = untrack(() => props.draftKey);

  if (key === undefined) return undefined;

  return createFormDraft(engine, {
    active: () => !engine.readOnly(),
    changed,
    delay: untrack(() => props.draftDelay) ?? DEFAULT_DELAY,
    fingerprint: untrack(() => props.draftFingerprint) ?? draftFingerprint(untrack(engine.start)),
    keep: (values) => omitPaths(values, untrack(() => props.draftOmit) ?? []),
    key: `${PREFIX}:${untrack(scope) ?? "anon"}:${key}`,
    ttl: untrack(() => props.draftTtl) ?? DEFAULT_TTL,
  });
}

function createUnsavedState(engine: FormEngine, props: FormUnsavedProps): FormUnsavedState {
  const messages = useUiMessages(FORM_UNSAVED_MESSAGES_EN);
  const changed = createFormChanged(engine);
  const draft = createDraft(engine, props, changed);

  return {
    changed,
    discard: () => {
      draft?.clear();
      discardChanges(engine);
    },
    draft,
    label: () => props.label ?? engine.name() ?? messages.unsavedThisForm,
    policy: () => (draft === undefined || draft.broken() ? "confirm" : "draft"),
  };
}

/**
 * Turns on unsaved changes for its Form: the page's guard (UnsavedChangesProvider) asks before they
 * are lost, or, with `draftKey`, they are kept on this device as a draft, restored on the next
 * visit and deleted by a save or a discard. Wrap the Form's content in it, so FormUnsavedStatus,
 * FormDraftNotice and FormSaveBar can sit anywhere inside.
 *
 *     <Form form={form} aria-label="Invoice">
 *       <FormUnsaved draftKey={`invoice:${id}`}>
 *         <FormDraftNotice />
 *         …fields…
 *         <FormUnsavedStatus /> <SubmitButton>Save</SubmitButton>
 *       </FormUnsaved>
 *     </Form>
 */
export function FormUnsaved(props: FormUnsavedProps): JSX.Element {
  const engine = useFormEngine("FormUnsaved");
  const state = createUnsavedState(engine, props);

  useRegisterUnsaved(state);
  useFormSubmitted(() => state.draft?.clear());

  return <FORM_UNSAVED_CONTEXT value={state}>{props.children}</FORM_UNSAVED_CONTEXT>;
}
