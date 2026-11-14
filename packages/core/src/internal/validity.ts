import { createEffect, onSettled, untrack } from "solid-js";

import type { UiMessages } from "../provider/index.ts";
import { isBlankText, textLength } from "../text-hygiene/index.ts";
import { LENGTH_RULE, PASSWORD_TYPE, REQUIRED_RULE } from "./validity.constants.ts";

// A control's validity, rule by rule. Several rules can speak for one element (the box's own
// `required`, a control's format check, a composite's half range): each sets its own message here
// and the element reports one, `required` first, so no rule overwrites another's and the message
// is always the UI's, never the browser's.

// Where an element keeps its rules, by rule name: on the element itself, so no module holds them.
const RULES: unique symbol = /* @__PURE__ */ Symbol("ui.validity");

/** An element that takes a custom validity message: an input, a textarea, a select. */
export type ValidityTarget = {
  /** Sets the element's validity message; the empty string makes it valid. */
  setCustomValidity: (message: string) => void;
  /** The rules set on the element; owned by `setValidity`. */
  [RULES]?: Map<string, string>;
};

/** A validity target that can also be required. */
export type RequiredTarget = ValidityTarget & {
  /** Whether the element is required. */
  required: boolean;
};

/** Sets `rule`'s message on the element (none clears it) and reports the first one left. */
export function setValidity(
  element: ValidityTarget | null | undefined,
  rule: string,
  message: string | false | null | undefined,
): void {
  if (element === null || element === undefined) return;

  const rules = element[RULES] ?? new Map<string, string>();

  element[RULES] = rules;

  if (message === undefined || message === null || message === false || message === "") rules.delete(rule);
  else rules.set(rule, message);

  element.setCustomValidity(rules.get(REQUIRED_RULE) ?? rules.values().next().value ?? "");
}

/** What `setRequired` reads. */
export type RequiredCheck = {
  /** Whether the element holds nothing yet. */
  missing: boolean;
  /** What to report while it is required and missing. */
  message: string;
};

/** `check.message` as the element's `required` rule while it is required and missing. */
export function setRequired(element: RequiredTarget | null | undefined, check: RequiredCheck): void {
  setValidity(element, REQUIRED_RULE, element?.required === true && check.missing && check.message);
}

/** True when a text box holds nothing visible (a password counts every character). */
function isMissingText(element: HTMLInputElement | HTMLTextAreaElement): boolean {
  return element.type === PASSWORD_TYPE ? element.value === "" : isBlankText(element.value);
}

/** The props of a text box that `createRequiredText` reads. */
export type RequiredTextProps = {
  /** The box's own `ref`, called after the validity one. */
  ref?: (element: HTMLInputElement | HTMLTextAreaElement | null) => void;
  /** The controlled value; a change re-checks the box. */
  value?: unknown;
  /** Whether the box is required. */
  required?: boolean | "";
  /** The most characters a person may see. */
  maxLength?: number;
  /** The lowercase spelling of `maxLength`, as an attribute. */
  maxlength?: number | string | false | null;
};

/** What `createRequiredText` gives a text box. */
export type RequiredText = {
  /** Spread on the box: it finds the element, then calls the box's own `ref`. */
  ref: (element: HTMLInputElement | HTMLTextAreaElement | null) => void;
  /** Checks the box now; call it after each input. */
  sync: () => void;
};

// The limit a box was given, or undefined for none.
function maxOf(props: RequiredTextProps): number | undefined {
  const given = untrack(() => props.maxLength ?? props.maxlength);

  return given === undefined || given === null || given === false || given === "" ? undefined : Number(given);
}

/**
 * A text box's own rules (Input, Textarea): `required` treats whitespace or invisible text as
 * missing, and `maxLength` counts what a person sees (grapheme clusters, not UTF-16 units) and
 * reports the overflow rather than blocking typing. The messages are the UI's, passed in so the
 * caller decides where they come from (usually `useUiMessages()`); the object may hold getters, so
 * a language switch is read at the next check. Spread `ref` and call `sync` after each input; it
 * also follows `value`, `required` and `maxLength`, and checks once the box mounts.
 */
export function createRequiredText(props: RequiredTextProps, messages: UiMessages): RequiredText {
  let element: HTMLInputElement | HTMLTextAreaElement | undefined;

  function sync(): void {
    if (element === undefined) return;

    setRequired(element, { message: messages.requiredText, missing: isMissingText(element) });

    const max = maxOf(props);
    const length = max === undefined ? 0 : textLength(element.value);

    setValidity(element, LENGTH_RULE, max !== undefined && length > max && messages.textTooLong(length, max));
  }

  createEffect(
    () => [props.value, props.required, props.maxLength, props.maxlength],
    () => queueMicrotask(sync),
  );
  onSettled(sync);

  return {
    ref: (next) => {
      element = next ?? undefined;

      props.ref?.(next);
    },
    sync,
  };
}

/** What `createRequiredRule` needs from a composite. */
export type RequiredRuleOptions = {
  /** The hidden validation input the composite reports through. */
  element: () => RequiredTarget | null | undefined;
  /** Whether the composite is required. */
  required: () => boolean | undefined;
  /** Whether it is missing something (a range with one end, a dot for a signature, blank rows). */
  missing: () => boolean;
  /** The message to report, in the kind's words. */
  message: () => string;
};

/**
 * A composite's `required` on its validation input: missing while `missing` holds, in the kind's
 * words. Returns the check, for a control that must run it at once (on mount).
 */
export function createRequiredRule(options: RequiredRuleOptions): () => void {
  function sync(): void {
    const isRequired = untrack(options.required) === true;

    setValidity(options.element(), REQUIRED_RULE, isRequired && untrack(options.missing) && untrack(options.message));
  }

  createEffect(
    () => [options.required(), options.missing(), options.message()],
    () => queueMicrotask(sync),
  );

  return sync;
}
