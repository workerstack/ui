import type { JSX } from "@solidjs/web";
import { createSignal, flush, omit, Show, untrack } from "solid-js";

import { cn } from "../cn/index.ts";
import { FIELD_MARKS_CONTEXT, type FieldMarks } from "../field/index.ts";
import { callRef, type RefLike } from "../internal/index.ts";
import {
  createJoined,
  createStart,
  FORM_ENGINE_CONTEXT,
  FORM_PENDING_CONTEXT,
  type FormEngine,
  type FormReveal,
  type FormSubmitted,
  type Joined,
  type SubmitGuard,
} from "./form-engine.ts";
import { errorSummaryItems, FormErrorSummary } from "./form-error-summary.tsx";
import { anyForm, FORM_READ_ONLY_CONTEXT, type FormFor } from "./form-field.ts";
import { focusField, focusFirstInvalid } from "./form-focus.ts";
import { createArrivals, runSubmit } from "./form-submit.ts";

/** A submit that finds this many problems or more lists them above the form; fewer go to the field. */
const SUMMARY_FROM = 2;

const FORM_CLASS = "flex flex-col gap-5";

/** A form element's props, plus the TanStack form and how its fields show. */
export type FormProps<TFormData> = Omit<JSX.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "ref"> & {
  /** The form from `createForm`. */
  form: FormFor<TFormData>;
  /** Shows every field's value without letting it change; a Root's own `readOnly` wins. */
  readOnly?: boolean;
  /** Paths still loading: a submit waits for them; parts read them through `FORM_PENDING_CONTEXT`. */
  pending?: readonly string[];
  /** Which fields are marked on their labels; a read-only form marks none. @default "required" */
  marks?: FieldMarks;
  /** The `<form>` element. */
  ref?: RefLike<HTMLFormElement>;
};

/** A Form's engine and what only the Form itself writes. */
type EngineParts = {
  engine: FormEngine;
  guards: Joined<SubmitGuard>;
  reveals: Joined<FormReveal>;
  submitted: Joined<FormSubmitted>;
  node: { form?: HTMLFormElement };
  setWaiting: (waiting: boolean) => void;
};

function isLabel(value: unknown): value is string {
  return typeof value === "string";
}

function formName(element: HTMLFormElement | undefined, label: string | undefined): string | undefined {
  return label ?? element?.querySelector("legend, h1, h2, h3")?.textContent.trim();
}

function createEngine<TFormData>(props: FormProps<TFormData>): EngineParts {
  const guards = createJoined<SubmitGuard>();
  const reveals = createJoined<FormReveal>();
  const submitted = createJoined<FormSubmitted>();
  const form = anyForm(untrack(() => props.form));
  const node: EngineParts["node"] = {};
  // Written from the submit's async steps and the hooks of any part.
  const [waiting, setWaiting] = createSignal(false, { ownedWrite: true });

  const engine: FormEngine = {
    ...createStart(form),
    addGuard: guards.add,
    addReveal: reveals.add,
    addSubmitted: submitted.add,
    element: () => node.form,
    form,
    name: () => formName(node.form, isLabel(props["aria-label"]) ? props["aria-label"] : undefined),
    pending: () => props.pending ?? [],
    readOnly: () => props.readOnly === true,
    waiting,
  };

  return { engine, guards, node, reveals, setWaiting, submitted };
}

/** The summary element, once it is in the page. */
type SummaryNode = { element?: HTMLDivElement };

/** The error summary a submit opens. */
type Summary = {
  open: () => boolean;
  close: () => void;
  show: () => void;
  goTo: (field: HTMLElement) => void;
  ref: (element: HTMLDivElement) => void;
};

/** Two or more problems after a submit list above the form; fewer focus the first invalid control. */
function createSummary(parts: EngineParts): Summary {
  const [open, setOpen] = createSignal(false, { ownedWrite: true });
  const summary: SummaryNode = {};

  return {
    close: () => setOpen(false),
    goTo: (field) => focusField(field, parts.reveals.entries()),
    open,
    ref: (element) => {
      summary.element = element;
    },
    show: () => {
      const root = parts.node.form;
      const isMany = errorSummaryItems(parts.engine.form.state.fieldMeta, root).length >= SUMMARY_FROM;

      setOpen(isMany);
      flush();

      if (isMany) summary.element?.focus();
      else if (root !== undefined) focusFirstInvalid(root, parts.reveals.entries());
    },
  };
}

function createSubmit(parts: EngineParts, summary: Summary): (event: SubmitEvent) => Promise<void> {
  const arrived = createArrivals(parts.engine.pending);

  return (event) => {
    event.preventDefault();
    event.stopPropagation();

    return runSubmit({
      arrived,
      form: parts.engine.form,
      guards: parts.guards.entries,
      saved: summary.close,
      setStart: parts.engine.setStart,
      setWaiting: parts.setWaiting,
      showProblems: summary.show,
      submitted: parts.submitted.entries,
      waiting: parts.engine.waiting,
    });
  };
}

/** What `FormContexts` takes. */
type FormContextsProps = { engine: FormEngine; marks: FieldMarks | undefined; children: JSX.Element };

/** The contexts a Form gives its fields. */
function FormContexts(props: FormContextsProps): JSX.Element {
  function pending(name: string): boolean {
    return props.engine.pending().includes(name);
  }

  function marks(): FieldMarks {
    return props.engine.readOnly() ? "none" : (props.marks ?? "required");
  }

  return (
    <FORM_ENGINE_CONTEXT value={props.engine}>
      <FORM_PENDING_CONTEXT value={pending}>
        <FORM_READ_ONLY_CONTEXT value={props.engine.readOnly}>
          <FIELD_MARKS_CONTEXT value={marks}>{props.children}</FIELD_MARKS_CONTEXT>
        </FORM_READ_ONLY_CONTEXT>
      </FORM_PENDING_CONTEXT>
    </FORM_ENGINE_CONTEXT>
  );
}

/**
 * Submits through TanStack (no native validation bubbles, one submit at a time, after pending
 * values and any running async check), then moves focus to the problem: the first invalid control,
 * or the error summary when there are two or more. A successful submit makes the sent values where
 * the form starts from.
 *
 *     const form = createForm(() => ({ defaultValues: { email: "" }, onSubmit }));
 *     <Form form={form}>
 *       <FormTextInput.Root form={form} name="email">…</FormTextInput.Root>
 *       <SubmitButton>Save</SubmitButton>
 *     </Form>
 */
export function Form<TFormData>(props: FormProps<TFormData>): JSX.Element {
  const rest = omit(props, "class", "children", "form", "marks", "pending", "readOnly", "ref");
  const parts = createEngine(props);
  const summary = createSummary(parts);
  const submit = createSubmit(parts, summary);

  function ref(element: HTMLFormElement): void {
    parts.node.form = element;
    callRef(() => props.ref, element);
  }

  return (
    <FormContexts engine={parts.engine} marks={props.marks}>
      <form {...rest} ref={ref} data-slot="form" novalidate onSubmit={submit} class={cn(FORM_CLASS, props.class)}>
        <Show when={summary.open()}>
          <FormErrorSummary
            form={parts.engine.form}
            root={parts.engine.element}
            goTo={summary.goTo}
            ref={summary.ref}
          />
        </Show>
        {props.children}
      </form>
    </FormContexts>
  );
}
