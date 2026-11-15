import { createSignal, untrack, type Accessor } from "solid-js";

import { useRequiredMark } from "../components/field/field-marks.tsx";
import { callRef, type RefLike } from "./ref.ts";
import { REQUIRED_RULE } from "./validity.constants.ts";
import { createRequiredRule, setValidity } from "./validity.ts";

/** What `createRequiredInputs` reads. */
type RequiredInputsOptions = {
  /** The hidden native inputs that take part in the form; read when the rule runs. */
  inputs: () => readonly HTMLInputElement[];
  /** Whether the control is required. */
  required: () => boolean | undefined;
  /** Whether it holds nothing yet (unticked, no pick). */
  missing: () => boolean;
  /** What to report while it is required and missing, in the kind's words. */
  message: () => string;
};

/**
 * A control's `required` on its hidden native inputs (a checkbox, a switch, a group of radios), in
 * the UI's words instead of the browser's. The inputs keep their native `required`; this only
 * gives them a message while the control is missing a pick, and clears it after.
 */
function createRequiredInputs(options: RequiredInputsOptions): void {
  // One target that hands the rule's message to every input.
  const target = {
    required: true,
    setCustomValidity: (message: string) => {
      for (const input of untrack(options.inputs)) setValidity(input, REQUIRED_RULE, message);
    },
  };

  createRequiredRule({ ...options, element: () => target });
}

/** What `createTracked` reads. */
type TrackedOptions<Value> = {
  /** Whether a prop controls the value. */
  controlled: () => boolean;
  /** The controlled value; read only while `controlled`. */
  value: () => Value;
  /** The value before the control reports a change. */
  initial: Value;
};

/** A value the control holds itself until a prop controls it. */
export type Tracked<Value> = {
  /** The controlled value when there is one, else the last one the control reported. */
  current: Accessor<Value>;
  /** Records the control's own change. */
  set: (value: Value) => void;
};

/** Follows a control's value, controlled or not, so a rule can read it. */
function createTracked<Value>(options: TrackedOptions<Value>): Tracked<Value> {
  // Boxed: a signal of a generic value cannot tell the value from a compute function.
  const [own, setOwn] = createSignal({ value: options.initial });

  return {
    current: () => (options.controlled() ? options.value() : own().value),
    set: (value) => setOwn({ value }),
  };
}

/** The hidden input that follows a control's element (a checkbox's button, a group's element). */
export function siblingInput(element: HTMLElement | undefined, part: string): HTMLInputElement[] {
  const next = element?.nextElementSibling;

  return next instanceof HTMLInputElement && next.dataset.slot === part ? [next] : [];
}

/** What `createRequiredToggle` reads from a checkbox's or switch's props. */
export type RequiredToggleProps<Value, Details> = {
  /** The controlled state. */
  checked?: Value | undefined;
  /** The state at the start. */
  defaultChecked?: Value | undefined;
  /** Whether it must be on. */
  required?: boolean | undefined;
  /** The control's own `ref`. */
  ref?: RefLike<HTMLButtonElement>;
  /** The control's own change handler. */
  onCheckedChange?: ((value: Value, details: Details) => void) | undefined;
};

/** What `createRequiredToggle` gives the control: spread both on it. */
export type RequiredToggle<Value, Details> = {
  /** Finds the control's element, then calls its own `ref`. */
  ref: (element: HTMLButtonElement) => void;
  /** Tracks the change, then calls the control's own handler. */
  onCheckedChange: (value: Value, details: Details) => void;
};

/** What `createRequiredToggle` needs besides the props. */
export type RequiredToggleOptions = {
  /** The `data-slot` of the hidden input that follows the control. */
  part: string;
  /** What to report while it is required and off. */
  message: () => string;
};

/** A checkbox's or switch's `required`: off reports `message` on its hidden input. */
export function createRequiredToggle<Value, Details>(
  props: RequiredToggleProps<Value, Details>,
  options: RequiredToggleOptions,
): RequiredToggle<Value, Details> {
  let control: HTMLButtonElement | undefined;

  const checked = createTracked<Value | undefined>({
    controlled: () => props.checked !== undefined,
    initial: untrack(() => props.defaultChecked),
    value: () => props.checked,
  });

  createRequiredInputs({
    inputs: () => siblingInput(control, options.part),
    message: options.message,
    missing: () => checked.current() !== true,
    required: () => props.required,
  });

  return {
    onCheckedChange: (value, details) => {
      checked.set(value);
      props.onCheckedChange?.(value, details);
    },
    ref: (element) => {
      control = element;
      callRef(() => props.ref, element);
    },
  };
}

/** What `createRequiredChoice` reads. */
export type RequiredChoiceOptions<Value> = TrackedOptions<Value> &
  Omit<RequiredInputsOptions, "missing"> & {
    /** Whether the value holds no pick (no radio chosen, no box checked). */
    isMissing: (value: Value) => boolean;
  };

/**
 * A group's `required` (checkboxes, radios): while required and nothing is picked, its hidden
 * inputs report `message`, and the enclosing Field's label is marked (the group hides `required`
 * from the browser). Returns the group's value, controlled or not; call `set` on every change.
 */
export function createRequiredChoice<Value>(options: RequiredChoiceOptions<Value>): Tracked<Value> {
  const picked = createTracked(options);

  useRequiredMark(options.required);
  createRequiredInputs({ ...options, missing: () => options.isMissing(picked.current()) });

  return picked;
}
