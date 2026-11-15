import type { JSX } from "@solidjs/web";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../../dialog/index.ts";
import type { FormDialogProps } from "./form-dialog-props.ts";
import { FormOverlay, type OverlayShellProps } from "./form-overlay.tsx";

function DialogShell(props: OverlayShellProps): JSX.Element {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class={props.class}>{props.children}</DialogContent>
    </Dialog>
  );
}

/**
 * A dialog holding a form: Save submits it and closes on success; field errors from the save stay
 * on their fields with the dialog open. Closing with changes (Cancel, Escape, the backdrop, the ×)
 * asks whether to discard them. Each open starts a fresh form from `values`.
 *
 *     <FormDialog title="Edit account" values={{ name: "Ada" }} onSubmit={save}>
 *       {(form) => <FormText.Root form={form} name="name">…</FormText.Root>}
 *     </FormDialog>
 */
export function FormDialog<TFormData>(props: FormDialogProps<TFormData>): JSX.Element {
  return <FormOverlay {...props} shell={DialogShell} Title={DialogTitle} Description={DialogDescription} />;
}
