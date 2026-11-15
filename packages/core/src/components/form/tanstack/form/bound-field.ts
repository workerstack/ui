import type { AnyFieldApi } from "@tanstack/solid-form";
import { merge } from "solid-js";

import type { BoundField, Handler, OwnReadOnly, ValueBindings } from "./bound-field-types.ts";
import { errorMessages } from "./visibility.ts";

/** What `createBoundField` builds a field from. */
export type BoundFieldSource<TShows, TRootData> = {
  /** The TanStack field. */
  field: () => AnyFieldApi;
  /** The Root's props. */
  root: TRootData;
  /** The field's name. */
  name: () => string;
  /** What the control shows while the field is unset. */
  empty: TShows;
  /** The Root's or the Form's read-only. */
  readOnly: () => boolean;
  /** Whether the field's error shows. */
  invalid: () => boolean;
};

/** Whether focus moving to `next` leaves `box`: to nothing, or to an element outside it. */
export function focusLeaves(box: Element, next: EventTarget | null): boolean {
  return !(next instanceof Node) || !box.contains(next);
}

/** Retires a server error on the field: the person's change answers the submitted value. */
function retireServerError(field: AnyFieldApi): void {
  if (field.state.meta.errorMap.onServer !== undefined)
    field.setMeta((state) => ({ ...state, errorMap: { ...state.errorMap, onServer: undefined } }));
}

function valueOf<TShows>(source: BoundFieldSource<TShows, unknown>): () => TShows {
  return function value() {
    // TanStack holds the value as the form's type, which the Root checked against the module's.
    const held = source.field().state.value /* checked by the Root's ValueCheck */ as TShows | undefined;

    return held ?? source.empty;
  };
}

function bindingsOf<TWrites, TShows>(
  source: BoundFieldSource<TShows, unknown>,
  change: (next: TWrites) => void,
): (own: OwnReadOnly) => ValueBindings<TWrites, TShows> {
  const value = valueOf(source);

  return (own) => ({
    onValueChange: change,
    get readOnly() {
      return source.readOnly() || own.readOnly === true || undefined;
    },
    get value() {
      return value();
    },
  });
}

/** The handlers that blur the field and still run the consumer's own. */
function blurHandlers(blur: () => void): Pick<BoundField<unknown>, "blurring" | "leaving"> {
  return {
    blurring:
      (own) =>
      (...args) => {
        blur();
        own?.(...args);
      },
    leaving: (own) => (event) => {
      const box = event.currentTarget;

      if (!(box instanceof Element) || focusLeaves(box, event.relatedTarget)) blur();
      own?.(event);
    },
  };
}

/** Writes the value `settle` keeps on blur, when it differs. */
function settleValue<TWrites, TShows>(field: BoundField<TWrites, TShows>, settle?: (value: TShows) => TWrites): void {
  if (settle === undefined) return;
  const current = field.value();
  const settled = settle(current);

  if (!Object.is(settled, current)) field.change(settled);
}

/** What `settledBlur` reads. */
type SettledBlur<TWrites, TShows, TEvent extends FocusEvent> = {
  field: BoundField<TWrites, TShows>;
  settle: ((value: TShows) => TWrites) | undefined;
  own: Handler<[event: TEvent]>;
};

/** A blur handler that settles the value first, so the blur validators see what is kept. */
function settledBlur<TWrites, TShows, TEvent extends FocusEvent>(
  blur: SettledBlur<TWrites, TShows, TEvent>,
): (event: TEvent) => void {
  return (event) => {
    settleValue(blur.field, blur.settle);
    blur.field.blurring(blur.own)(event);
  };
}

/** The enclosing Root's field as its parts use it. */
export function createBoundField<TWrites, TShows, TRootData>(
  source: BoundFieldSource<TShows, TRootData>,
): BoundField<TWrites, TShows, TRootData> {
  function change(next: TWrites): void {
    retireServerError(source.field());
    source.field().handleChange(next);
  }

  const values = bindingsOf<TWrites, TShows>(source, change);
  const { blurring, leaving } = blurHandlers(() => source.field().handleBlur());

  const field: BoundField<TWrites, TShows, TRootData> = {
    // merge keeps the bindings' getters (a spread would read them once).
    bind: (own, settle) => merge(values(own), { onBlur: settledBlur({ field, own: own.onBlur, settle }) }),
    bindLeaving: (own) => merge(values(own), { onFocusOut: leaving(own.onFocusOut) }),
    blur: () => source.field().handleBlur(),
    blurring,
    change,
    invalid: source.invalid,
    leaving,
    messages: () => errorMessages(source.field().state.meta.errors),
    name: source.name,
    readOnly: source.readOnly,
    root: source.root,
    validating: () => source.field().state.meta.isValidating,
    value: valueOf(source),
    values,
  };

  return field;
}
