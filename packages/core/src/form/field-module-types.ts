import type { JSX } from "@solidjs/web";
import type { DeepKeys, DeepValue } from "@tanstack/solid-form";

import type { FieldOrientation } from "../field/index.ts";
import type { FormFor, ValidatorsFor } from "./form-field.ts";

// The types that check a module's Root against the field it takes: the module declares what its
// control writes and shows, and a Root takes a field by `form` and `name` only when the field holds
// that type. When it does not, `name` gets a `FieldTypeMismatch`, so the error names all three.

/** Type-only key of a module's value type on its Root (never set at runtime). */
declare const moduleValue: unique symbol;

/** Why a module's Root can't take a field: the field, the type it holds, the type the control writes. */
export type FieldTypeMismatch<TName, TField, TControl> = {
  /** The field's name. */
  readonly field: TName;
  /** What the field holds. */
  readonly holds: TField;
  /** What the module's control writes. */
  readonly controlWrites: TControl;
};

/** `any` or `unknown`: a value nothing can be checked against. */
type Loose<T> = 0 extends 1 & T ? true : unknown extends T ? true : false;

/** A union of names is a name the form doesn't have: its own error lists the names. */
type IsUnion<T, U = T> = T extends unknown ? ([U] extends [T] ? false : true) : never;

/** A path's value by its segments (`a.b`, `items[0].email`), so an error prints the type itself. */
type PathValue<T, P> = P extends `${infer Head}.${infer Rest}`
  ? PathValue<SegmentValue<T, Head>, Rest>
  : SegmentValue<T, P>;

/** One segment's value: a key, or a list's item (`items[0]`); a nullable parent stays nullable. */
type SegmentValue<T, S> = S extends `${infer K}[${number}]`
  ? ItemOf<SegmentValue<T, K>>
  : T extends null | undefined
    ? T | (S extends keyof NonNullable<T> ? NonNullable<T>[S] : never)
    : S extends keyof T
      ? T[S]
      : never;

/** A list's item type. */
type ItemOf<T> = T extends readonly (infer E)[] ? E : T extends null | undefined ? T : never;

/** `TPrinted` where it equals `TValue` (it prints as the type itself, not an alias), else `TValue`. */
type Printable<TPrinted, TValue> = [TPrinted] extends [TValue]
  ? [TValue] extends [TPrinted]
    ? TPrinted
    : TValue
  : TValue;

/** The value of the form's field at `name`, as TanStack holds it. */
export type FieldValue<TFormData, TName> = TName extends keyof TFormData
  ? TFormData[TName]
  : TName extends DeepKeys<TFormData>
    ? Printable<PathValue<TFormData, TName>, DeepValue<TFormData, TName>>
    : never;

/**
 * Whether a field of type `TField` takes a control that writes `TWrites` and shows `TShows`:
 * everything the control writes fits the field, and every value the field holds besides `null` and
 * `undefined` is one the control shows. A field of `any` or `unknown` takes any control.
 */
export type FieldTakes<TField, TWrites, TShows> =
  Loose<TField> extends true
    ? true
    : [TWrites] extends [TField]
      ? [Exclude<TField, null | undefined>] extends [TShows]
        ? true
        : false
      : false;

/** Nothing when the field fits the module, else a `name` of `FieldTypeMismatch`. */
export type ValueCheck<TFormData, TName extends DeepKeys<TFormData>, TWrites, TShows> =
  Loose<TWrites> extends true
    ? unknown
    : true extends IsUnion<TName>
      ? unknown
      : FieldTakes<FieldValue<TFormData, TName>, TWrites, TShows> extends true
        ? unknown
        : MismatchedName<TName, FieldValue<TFormData, TName>, TWrites>;

/** A Root's `name` when its field doesn't fit the module. */
export type MismatchedName<TName, TField, TControl> = {
  /** Why the module can't take the field. */
  name: FieldTypeMismatch<TName, TField, TControl>;
};

/** What every module's Root takes. */
export type RootProps<TFormData, TName extends DeepKeys<TFormData>> = {
  /** The field's parts: label, control, description, error. */
  children?: JSX.Element;
  /** Extra classes for the Field. */
  class?: string;
  /** The form from `createForm`. */
  form: FormFor<TFormData>;
  /** The field's path in the form's values. */
  name: TName;
  /** How the label and control sit. */
  orientation?: FieldOrientation;
  /** Shows the value without letting it change: `Control` renders the View. Defaults to the Form's. */
  readOnly?: boolean;
  /** Marks the label as required. */
  required?: boolean;
  /** The field's validators. */
  validators?: ValidatorsFor<TFormData, TName>;
};

/** What a module's control writes and shows, as variance checks them. */
export type ModuleValue<TWrites, TShows> = {
  /** What the control writes (covariant). */
  readonly writes: TWrites;
  /** What the control shows (contravariant, a parameter). */
  readonly shows: (value: TShows) => void;
};

/** A module's Root: a field of the form by `name`, checked against what the module's control writes. */
export type FieldRoot<TWrites, TShows = TWrites, TRootData = object> = {
  /** Binds a field of `form` by `name`, when it holds what the module's control writes. */
  <TFormData, TName extends DeepKeys<TFormData>>(
    props: RootProps<TFormData, TName> & TRootData & ValueCheck<TFormData, TName, TWrites, TShows>,
  ): JSX.Element;
  /** The module's value types, for `FieldModuleValue` (never set at runtime). */
  readonly [moduleValue]?: ModuleValue<TWrites, TShows>;
};

/** The value type a module's control writes (`FieldModuleValue<typeof textInputField>` is `string`). */
export type FieldModuleValue<TModule> = TModule extends {
  readonly Root: { readonly [moduleValue]?: ModuleValue<infer TValue, never> };
}
  ? TValue
  : never;

/** A field module that takes a field of type `TValue`, by the same rule as a Root's check. */
export type FieldModuleFor<TValue> = {
  /** The module's Root. */
  readonly Root: { readonly [moduleValue]?: ModuleValue<TValue, Exclude<TValue, null | undefined>> };
};
