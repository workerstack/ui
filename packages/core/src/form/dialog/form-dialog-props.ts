import type { JSX } from "@solidjs/web";

import type { DrawerSide } from "../../drawer/index.ts";
import type { FormFor } from "../form-field.ts";
import type { ServerFieldErrors } from "../server-errors.ts";

/** What a save returns to keep the dialog open: field errors by the form's paths. */
type FormDialogErrors<TFormData> = ServerFieldErrors<TFormData>;

/** What a save may return: nothing (close), or field errors (stay open and show them). */
export type FormDialogResult<TFormData> = FormDialogErrors<TFormData> | undefined | void;

/** What `FormDialog` takes. */
export type FormDialogProps<TFormData> = {
  /** Names the dialog. */
  title: JSX.Element;
  /** Says what the dialog is for. */
  description?: JSX.Element;
  /** Where each open starts: a fresh form is made from it, so a cancelled edit never comes back. */
  values: TFormData;
  /** The fields, given the form. */
  children: (form: FormFor<TFormData>) => JSX.Element;
  /**
   * Saves the values. Resolving closes the dialog; returning field errors, or throwing an HTTP
   * error with a body `applyHttpFormError` reads, keeps it open and shows them.
   */
  onSubmit?: (values: TFormData) => FormDialogResult<TFormData> | Promise<FormDialogResult<TFormData>>;
  /** Whether it is open (controlled). */
  open?: boolean;
  /** Whether it starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Hears each change of whether it is open. */
  onOpenChange?: (open: boolean) => void;
  /** Renders what opens it, given the function that does. */
  trigger?: (open: () => void) => JSX.Element;
  /** The submit button's label. @default the provider's `formSave` */
  submitLabel?: JSX.Element;
  /** Classes for the dialog's window. */
  class?: string;
};

/** What `FormDrawer` takes: a dialog's props, plus the edge it slides from. */
export type FormDrawerProps<TFormData> = FormDialogProps<TFormData> & {
  /** The edge the drawer slides in from. */
  side?: DrawerSide;
};
