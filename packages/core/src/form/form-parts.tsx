import type { JSX } from "@solidjs/web";
import { useStore } from "@tanstack/solid-form";
import { omit, Show } from "solid-js";

import { Button, type ButtonProps } from "../button/index.ts";
import { cn } from "../cn/index.ts";
import { useFormEngine } from "./form-engine.ts";
import { errorMessages } from "./visibility.ts";

/** Whether the enclosing Form is saving: submitting, or waiting on checks and pending values first. */
export function useFormBusy(): () => boolean {
  const engine = useFormEngine("useFormBusy");
  const submitting = useStore(engine.form.store, (state) => state.isSubmitting);

  return () => submitting() || engine.waiting();
}

/** A Button's props, without `type` (it submits) and `loading` (the form decides). */
export type SubmitButtonProps = Omit<ButtonProps, "type" | "loading">;

/** Its Form's submit button: loading (a spinner, disabled, `aria-busy`) while the form saves. */
export function SubmitButton(props: SubmitButtonProps): JSX.Element {
  const busy = useFormBusy();

  return <Button {...props} type="submit" loading={busy()} />;
}

/** What `FormError` takes: a paragraph's props. */
export type FormErrorProps = JSX.HTMLAttributes<HTMLParagraphElement>;

/** Its Form's form-level errors (from form validators or the server), announced as they appear. */
export function FormError(props: FormErrorProps): JSX.Element {
  const rest = omit(props, "class");
  const engine = useFormEngine("FormError");
  const errors = useStore(engine.form.store, (state): readonly unknown[] => state.errors);

  function message(): string {
    return errorMessages(errors()).join(" ");
  }

  return (
    <Show when={message() !== ""}>
      <p
        role="alert"
        data-slot="form-error"
        {...rest}
        class={cn("rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive", props.class)}
      >
        {message()}
      </p>
    </Show>
  );
}
