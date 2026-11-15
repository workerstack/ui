import type { JSX } from "@solidjs/web";
import { createField, getBy, useStore, type AnyFieldApi, type AnyFormApi } from "@tanstack/solid-form";
import { createEffect, createUniqueId, untrack, useContext } from "solid-js";

import { Fieldset } from "../../field/index.ts";
import type { FormValue, FormValues } from "../form-engine.ts";
import {
  anyForm,
  ERROR_REVEAL_CONTEXT,
  FORM_READ_ONLY_CONTEXT,
  type FormFor,
  type ValidatorsFor,
} from "../form-field.ts";
import { errorMessages, showsErrors } from "../visibility.ts";
import { FORM_ARRAY_CONTEXT, type ArrayKeys, type FormArrayState } from "./array-context.ts";
import { focusLater } from "./array-focus.ts";

/** What `formArray.Root` takes. */
export type FormArrayRootProps<TFormData, TName extends ArrayKeys<TFormData>> = {
  /** A FieldsetLegend first, then the Items, Add and Error. */
  children?: JSX.Element;
  /** Classes on the group. */
  class?: string;
  /** The form, from `createForm`. */
  form: FormFor<TFormData>;
  /** The path of the array in the form's values. */
  name: TName;
  /** The array's own rules (item count, uniqueness), run on every change of an item too. */
  validators?: ValidatorsFor<TFormData, TName>;
  /** Remove disables at this many items. @default 0 */
  min?: number;
  /** Add disables at this many items. @default no limit */
  max?: number;
};

/** The array's items, as the form's values hold them. */
type ArrayItems = readonly FormValue[];

const NO_ITEMS: ArrayItems = [];

function isItems(value: FormValue): value is ArrayItems {
  return Array.isArray(value);
}

/** The array's items in the form's values now: none while the path holds no array. */
function itemsNow(form: AnyFormApi, name: string): ArrayItems {
  const values = form.state.values /* TanStack's AnyFormApi types values as any */ as FormValues;
  const value = getBy(values, name) /* getBy returns any: the value at a path of form values */ as FormValue;

  return isItems(value) ? value : NO_ITEMS;
}

/** The array's TanStack field; created untracked, as the field modules do (docs/upstream/tanstack-form.md, TF-5). */
function arrayField(form: AnyFormApi, name: string, validators: () => object | undefined): () => AnyFieldApi {
  return untrack(() => createField(() => ({ form, mode: "array" as const, name, validators: validators() ?? {} })));
}

/**
 * TanStack validates an array field on its own operations (add, remove, move), not on an item's
 * change: this runs its rules whenever an item changes too, so a uniqueness rule follows the items.
 * TanStack skips an untouched field, so an item's change touches the array; errors still wait for
 * a submit. Untracked: the effect writes the form store (docs/upstream/tanstack-form.md, TF-4).
 */
function revalidateOnItems(items: () => ArrayItems, field: () => AnyFieldApi): void {
  createEffect(items, (_value, previous) => {
    if (previous === undefined) return;

    untrack(() => {
      const current = field();

      if (!current.state.meta.isTouched) current.setMeta((meta) => ({ ...meta, isTouched: true }));
      void current.validate("change");
    });
  });
}

/**
 * How many items the array holds: tracks `values` (the array in the form's values, so a write from
 * outside shows too), and reads the values now, so Add focuses the new item in the same task.
 */
function itemCount(form: AnyFormApi, name: string, values: () => ArrayItems): () => number {
  return () => {
    values();

    return itemsNow(form, name).length;
  };
}

/** What the parts share: the field, its counts, its error state and how focus follows a change. */
function createArrayState<TFormData, TName extends ArrayKeys<TFormData>>(
  props: FormArrayRootProps<TFormData, TName>,
  root: () => HTMLElement | undefined,
): FormArrayState {
  const form = anyForm(untrack(() => props.form));
  const name: string = untrack(() => props.name);
  const field = arrayField(form, name, () => props.validators);
  const attempts = useStore(form.store, (state) => state.submissionAttempts);
  const early = useContext(ERROR_REVEAL_CONTEXT);
  const readOnly = useContext(FORM_READ_ONLY_CONTEXT);
  const values = useStore(form.store, () => itemsNow(form, name));

  revalidateOnItems(values, field);

  return {
    errorId: `form-array-error-${createUniqueId()}`,
    field,
    focusItem: (index, parts) => focusLater(root, index, parts),
    invalid: () => showsErrors({ attempts: attempts(), early: early(name), isValid: field().state.meta.isValid }),
    length: itemCount(form, name, values),
    max: () => props.max ?? Number.POSITIVE_INFINITY,
    messages: () => errorMessages(field().state.meta.errors),
    min: () => props.min ?? 0,
    readOnly,
  };
}

/**
 * A TanStack array field as a group named by its legend. Its Items render one group per item, bound
 * by path (`invites[${index}].email`); Add appends, Remove and MoveUp/MoveDown act on an item, a
 * Handle drags it, and Error shows the array's own errors by the form's error rule.
 */
export function FormArrayRoot<TFormData, TName extends ArrayKeys<TFormData>>(
  props: FormArrayRootProps<TFormData, TName>,
): JSX.Element {
  let node: HTMLElement | undefined;
  const array = createArrayState(props, () => node);

  return (
    <FORM_ARRAY_CONTEXT value={array}>
      <Fieldset
        ref={(element: HTMLFieldSetElement) => {
          node = element;
        }}
        data-field-name={props.name}
        data-invalid={array.invalid() ? "" : undefined}
        aria-describedby={array.invalid() ? array.errorId : undefined}
        class={props.class}
      >
        {props.children}
      </Fieldset>
    </FORM_ARRAY_CONTEXT>
  );
}
