import type { JSX } from "@solidjs/web";
import { createContext, createSignal, onSettled, useContext, type Context } from "solid-js";

import { useUiMessages } from "../provider/index.ts";

/**
 * Which fields a form marks on their labels: required ones with an asterisk, optional ones with
 * the "(optional)" text, both (marking one kind leaves people guessing at the other), or none.
 */
export type FieldMarks = "both" | "required" | "optional" | "none";

/** The mark a label or legend carries: its `data-mark` value. */
export type FieldMark = "required" | "optional";

/** The text drawn after a required label, by the theme from `data-mark-text`. */
export const REQUIRED_MARK_TEXT = "*";

/**
 * The enclosing form's marks as a getter; outside a provider nothing is marked. Provide it with
 * `FieldMarksProvider`, or directly: `<FIELD_MARKS_CONTEXT value={() => "both"}>`.
 */
export const FIELD_MARKS_CONTEXT: Context<() => FieldMarks> = /* @__PURE__ */ createContext<() => FieldMarks>(
  () => "none",
);

/** What `FieldMarksProvider` takes. */
export type FieldMarksProviderProps = {
  /** Which fields the labels below mark. */
  marks: FieldMarks;
  /** The form's fields. */
  children?: JSX.Element;
};

/** Makes every Field and Fieldset below mark its label as `marks` says. */
export function FieldMarksProvider(props: FieldMarksProviderProps): JSX.Element {
  return <FIELD_MARKS_CONTEXT value={() => props.marks}>{props.children}</FIELD_MARKS_CONTEXT>;
}

/** What a Field knows about its controls' `required`, for its label's mark. */
export type FieldRequired = {
  /** Whether the Field's own `required`, or any control that joined, is required. */
  required: () => boolean;
  /** Whether the Field is read-only, so its label shows no mark. */
  readOnly: () => boolean;
  /** Joins a source of `required`; returns how to leave. */
  add: (source: () => boolean) => () => void;
};

// Leaving a source that never joined.
function leaveNothing(): void {
  return;
}

// No Field (a control on its own): no mark.
const NO_FIELD: FieldRequired = { add: () => leaveNothing, readOnly: () => true, required: () => false };

/** The enclosing Field's required state. */
export const FIELD_REQUIRED_CONTEXT: Context<FieldRequired> = /* @__PURE__ */ createContext<FieldRequired>(NO_FIELD);

/** What `createFieldRequired` reads from a Field's props. */
export type FieldRequiredProps = {
  /** The Field's own `required`. */
  required: () => boolean | undefined;
  /** The Field's `readOnly`. */
  readOnly: () => boolean | undefined;
};

/** A Field's required state: its own `required`, or any joined source that is. */
export function createFieldRequired(props: FieldRequiredProps): FieldRequired {
  const [sources, setSources] = createSignal<readonly (() => boolean)[]>([]);

  return {
    add: (source) => {
      setSources((previous) => [...previous, source]);

      return () => setSources((previous) => previous.filter((entry) => entry !== source));
    },
    readOnly: () => props.readOnly() === true,
    required: () => props.required() === true || sources().some((source) => source()),
  };
}

/**
 * Tells the enclosing Field that its control is required while `required` holds, so its label
 * shows the mark. UI SDK already reads `required` and `aria-required` off a native control, so a
 * control needs this only when it hides them (a group of checkboxes, a composite). Does nothing
 * outside a Field. Call it in the control's body with its `required` getter.
 */
export function useRequiredMark(required: () => boolean | undefined): void {
  const field = useContext(FIELD_REQUIRED_CONTEXT);

  if (field === NO_FIELD) return;

  // Joining re-renders the label's mark, which a signal write inside onSettled or a disposal may
  // not do, so join and leave on the next microtask.
  onSettled(() => {
    let leave: (() => void) | undefined;
    let isLeft = false;

    queueMicrotask(() => {
      if (!isLeft) leave = field.add(() => required() === true);
    });

    return () => {
      isLeft = true;
      queueMicrotask(() => leave?.());
    };
  });
}

/** What `markFor` reads. */
type MarkChoice = {
  /** Whether the field is required. */
  required: boolean;
  /** Which fields the form marks. */
  marks: FieldMarks;
};

/** The mark a form's `marks` give a field that is or is not required. */
function markFor(choice: MarkChoice): FieldMark | undefined {
  const wanted = choice.required ? "required" : "optional";

  return choice.marks === "both" || choice.marks === wanted ? wanted : undefined;
}

/** The attributes the theme draws a mark from. */
export type MarkAttributes = {
  /** `required`, `optional`, or none. */
  "data-mark": FieldMark | undefined;
  /** The text to draw after the label. */
  "data-mark-text": string | undefined;
};

/** The part of UI SDK's field state a label's mark reads. */
export type MarkState = {
  /** Whether the field's control is required. */
  required: boolean;
};

/**
 * A label's or legend's mark attributes, as a function to call where they are read. `own` is the
 * legend's `required`: given, it says whether the group is required; left out, a field's state
 * decides, and a read-only field or a legend with no field marks nothing. A label passes UI SDK's
 * field state to the function.
 */
export function useMarkAttributes(own?: () => boolean | undefined): (state?: MarkState) => MarkAttributes {
  const marks = useContext(FIELD_MARKS_CONTEXT);
  const field = useContext(FIELD_REQUIRED_CONTEXT);
  const messages = useUiMessages();

  return (state) => {
    const given = own?.();
    const shown = given === undefined && field.readOnly() ? "none" : marks();
    const required = given ?? (state?.required === true || field.required());
    const mark = markFor({ marks: shown, required });
    const text = mark === "required" ? REQUIRED_MARK_TEXT : messages.optionalMark;

    return { "data-mark": mark, "data-mark-text": mark === undefined ? undefined : text };
  };
}
