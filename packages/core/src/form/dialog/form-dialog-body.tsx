import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";

import { Form } from "../form.tsx";
import { createDialogForm } from "./create-dialog-form.ts";
import { FormDialogLayout, type FormDialogLayoutProps } from "./form-dialog-layout.tsx";
import type { FormDialogProps } from "./form-dialog-props.ts";

/** What `FormDialogBody` takes. */
export type FormDialogBodyProps<TFormData> = Pick<FormDialogProps<TFormData>, "onSubmit" | "values"> &
  Omit<FormDialogLayoutProps<TFormData>, "form" | "titleId"> & {
    /** Closes the dialog without asking (a save worked). */
    finish: () => void;
  };

/** The open dialog's content: header, fields and footer inside one form, so Enter and Save submit it. */
export function FormDialogBody<TFormData>(props: FormDialogBodyProps<TFormData>): JSX.Element {
  const titleId = createUniqueId();

  const form = createDialogForm({
    finish: props.finish,
    get onSubmit() {
      return props.onSubmit;
    },
    get values() {
      return props.values;
    },
  });

  return (
    <Form form={form} aria-labelledby={titleId} data-slot="form-dialog" class="min-h-0 flex-1 gap-4">
      <FormDialogLayout {...props} form={form} titleId={titleId} />
    </Form>
  );
}
