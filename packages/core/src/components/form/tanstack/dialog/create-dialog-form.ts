import { createForm } from "@tanstack/solid-form";
import { untrack } from "solid-js";

import { type FormFor } from "../form/form-field.ts";
import { applyHttpFormError, applyServerErrors, isHttpFormError } from "../form/server-errors.ts";
import type { FormDialogProps } from "./form-dialog-props.ts";

/** What the dialog's form needs of its dialog. */
export type DialogFormSource<TFormData> = {
  /** Saves the values. */
  onSubmit: FormDialogProps<TFormData>["onSubmit"] | undefined;
  /** Where the form starts. */
  values: TFormData;
  /** Called when a save succeeded: closes the dialog without asking. */
  finish: () => void;
};

/**
 * A fresh form from `values`. A save that resolves closes the dialog; field errors it returns, or
 * an HTTP error it throws, go on their fields (or the form's alert) and keep the dialog open.
 */
export function createDialogForm<TFormData>(source: DialogFormSource<TFormData>): FormFor<TFormData> {
  const form: FormFor<TFormData> = createForm(() => ({
    defaultValues: untrack(() => source.values),
    onSubmit: async ({ value }: { value: TFormData }) => {
      if (
        await save(
          form,
          untrack(() => source.onSubmit),
          value,
        )
      )
        source.finish();
    },
  }));

  return form;
}

/** Runs the save; `true` when it succeeded, `false` when it put problems on the form. */
async function save<TFormData>(
  form: FormFor<TFormData>,
  onSubmit: DialogFormSource<TFormData>["onSubmit"],
  value: TFormData,
): Promise<boolean> {
  try {
    const errors = await onSubmit?.(value);

    if (errors === undefined || Object.keys(errors).length === 0) return true;
    applyServerErrors(form, errors);

    return false;
  } catch (error) {
    if (!isHttpFormError(error) || !applyHttpFormError(form, error)) throw error;

    return false;
  }
}
