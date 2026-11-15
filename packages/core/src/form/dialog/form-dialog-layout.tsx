import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import { Button } from "../../button/index.ts";
import { useUiMessages } from "../../provider/index.ts";
import type { FormFor } from "../form-field.ts";
import { SubmitButton } from "../form-parts.tsx";
import { useCloseGuard, type CloseGuard } from "./form-close-guard.ts";
import type { FormDialogProps } from "./form-dialog-props.ts";

/** A title or description part of a dialog or a drawer. */
export type OverlayPart = (props: { id?: string; children?: JSX.Element }) => JSX.Element;

/** What `FormDialogLayout` takes. */
export type FormDialogLayoutProps<TFormData> = Pick<
  FormDialogProps<TFormData>,
  "children" | "description" | "submitLabel" | "title"
> & {
  /** The open form. */
  form: FormFor<TFormData>;
  /** The shell's title part. */
  Title: OverlayPart;
  /** The shell's description part. */
  Description: OverlayPart;
  /** Receives the open form's state, for the close check. */
  guard: CloseGuard;
  /** Asks to close (Cancel); the dialog may ask to discard first. */
  requestClose: () => void;
  /** The id the title takes, which names the form. */
  titleId: string;
};

/** What sits inside the Form: header, fields and footer. Must be rendered inside a Form. */
export function FormDialogLayout<TFormData>(props: FormDialogLayoutProps<TFormData>): JSX.Element {
  const messages = useUiMessages();

  useCloseGuard(props.guard);

  return (
    <>
      <div class="flex flex-col gap-1.5">
        <props.Title id={props.titleId}>{props.title}</props.Title>
        <Show when={props.description}>{(description) => <props.Description>{description()}</props.Description>}</Show>
      </div>
      <div data-slot="form-dialog-body" class="min-h-0 flex-1 overflow-y-auto">
        {props.children(props.form)}
      </div>
      <div data-slot="form-dialog-footer" class="mt-auto flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" type="button" onClick={props.requestClose}>
          {messages.formCancel}
        </Button>
        <SubmitButton>{props.submitLabel ?? messages.formSave}</SubmitButton>
      </div>
    </>
  );
}
