import type { AnyFieldApi, AnyFormApi, DeepKeys, DeepValue, StandardSchemaV1 } from "@tanstack/solid-form";
import { createContext, type Context } from "solid-js";

// What every field module shares: the form type a Root takes, field validators typed by the
// field's value, and the contexts a Form sets for its fields (read-only, errors shown before a
// submit).

/**
 * A form from `createForm`, of any validators, typed by its values. TanStack's form type is
 * invariant in its validator types, so the form is TanStack's own `AnyFormApi`; its values carry
 * the type a Root checks its `name` against.
 */
export type FormFor<TFormData> = Omit<AnyFormApi, ArrayMethod> & {
  /** The form's state; only its values' type matters here. */
  readonly state: FormValuesState<TFormData>;
};

/**
 * The array methods, whose values TanStack types through `DeepKeysOfType<TFormData, any[]>`: for
 * `AnyFormApi` that resolves to `never`, so a form with an array field would not fit (TF-3).
 */
type ArrayMethod =
  | "insertFieldValue"
  | "moveFieldValues"
  | "pushFieldValue"
  | "removeFieldValue"
  | "replaceFieldValue"
  | "swapFieldValues"
  | "clearFieldValues";

/** The part of a form's state a Root's check reads. */
export type FormValuesState<TFormData> = {
  /** The form's values. */
  readonly values: TFormData;
};

/** What a field validator gets. */
export type FieldValidatorInput<TData> = {
  /** The field's value. */
  value: TData;
  /** The TanStack field. */
  fieldApi: AnyFieldApi;
};

/** What an async field validator gets. */
export type AsyncFieldValidatorInput<TData> = FieldValidatorInput<TData> & {
  /** Aborts when a newer value starts another check. */
  signal: AbortSignal;
};

/** What a validator returns: the error (a message, an issue, anything TanStack keeps), or nothing. */
export type ValidatorResult = string | object | null | undefined;

/** A field validator: a function of the value (returning the error, if any) or a Standard Schema. */
type FieldValidator<TData> =
  | ((props: FieldValidatorInput<TData>) => ValidatorResult)
  | StandardSchemaV1<TData, unknown>;

/** An async check gets an AbortSignal too: a newer value aborts it, and its answer never lands. */
type AsyncFieldValidator<TData> =
  | ((props: AsyncFieldValidatorInput<TData>) => Promise<ValidatorResult>)
  | StandardSchemaV1<TData, unknown>;

/**
 * Field validators for `name`, as TanStack takes them (functions or Standard Schemas such as zod),
 * typed by the field's value so `({ value })` is inferred.
 */
export type ValidatorsFor<TFormData, TName extends DeepKeys<TFormData>> = {
  /** Runs when the field mounts. */
  onMount?: FieldValidator<DeepValue<TFormData, TName>>;
  /** Runs on every change. */
  onChange?: FieldValidator<DeepValue<TFormData, TName>>;
  /** Runs on change, after `onChangeAsyncDebounceMs`. */
  onChangeAsync?: AsyncFieldValidator<DeepValue<TFormData, TName>>;
  /** How long a change waits before its async check starts. */
  onChangeAsyncDebounceMs?: number;
  /** Other fields whose change runs this field's `onChange`. */
  onChangeListenTo?: DeepKeys<TFormData>[];
  /** Runs when the control loses focus. */
  onBlur?: FieldValidator<DeepValue<TFormData, TName>>;
  /** Runs on blur, after `onBlurAsyncDebounceMs`. */
  onBlurAsync?: AsyncFieldValidator<DeepValue<TFormData, TName>>;
  /** How long a blur waits before its async check starts. */
  onBlurAsyncDebounceMs?: number;
  /** Other fields whose blur runs this field's `onBlur`. */
  onBlurListenTo?: DeepKeys<TFormData>[];
  /** Runs on submit. */
  onSubmit?: FieldValidator<DeepValue<TFormData, TName>>;
  /** Runs on submit, async. */
  onSubmitAsync?: AsyncFieldValidator<DeepValue<TFormData, TName>>;
  /** Runs when the form's validation logic says (`revalidateLogic`). */
  onDynamic?: FieldValidator<DeepValue<TFormData, TName>>;
  /** As `onDynamic`, async. */
  onDynamicAsync?: AsyncFieldValidator<DeepValue<TFormData, TName>>;
  /** How long a dynamic check waits before it starts. */
  onDynamicAsyncDebounceMs?: number;
};

/** A Form's `readOnly`, which every Root inside it follows unless it sets its own. */
export const FORM_READ_ONLY_CONTEXT: Context<() => boolean> = /* @__PURE__ */ createContext<() => boolean>(() => false);

/**
 * Whether a field's errors show before any submit, by its name: a multi-step form reveals a step's
 * fields once its Next checked them, without counting a submission.
 */
export const ERROR_REVEAL_CONTEXT: Context<(name: string) => boolean> = /* @__PURE__ */ createContext<
  (name: string) => boolean
>(() => false);

/**
 * The form as TanStack's own `AnyFormApi`, for the calls that take one (`createField`): a
 * `FormFor` is a `createForm` form, so it has the array methods `FormFor` leaves out of its type.
 */
export function anyForm<TFormData>(form: FormFor<TFormData>): AnyFormApi {
  return form /* every FormFor is a createForm form: only its array methods' types are left out */ as AnyFormApi;
}
