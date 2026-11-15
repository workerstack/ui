import type { JSX } from "@solidjs/web";
import { useStore, type AnyFormApi } from "@tanstack/solid-form";
import { createMemo, createUniqueId, For, Show, untrack } from "solid-js";

import { useUiMessages } from "../provider/index.ts";
import { errorMessages, type QueryRoot } from "./visibility.ts";

// The problems a submit found, above the form (GOV.UK's error summary): a heading, then each
// field's message as a link that reveals the field and focuses its control. It follows the form as
// fields are fixed. A server error for a field the form doesn't show is listed as text. Form opens
// it after a submit that finds two or more problems.

/** Sort results: the left item first, the right item first. */
const LEFT_FIRST = -1;
const RIGHT_FIRST = 1;

/** Out of the tab order, but focusable from code (the Form focuses the summary). */
const FOCUS_FROM_CODE = -1;

const SUMMARY_CLASS =
  "rounded-md border border-destructive/45 bg-destructive/10 p-4 outline-none " +
  "focus-visible:ring-3 focus-visible:ring-ring/50";

/** One problem in the summary. */
export type ErrorSummaryItem = {
  /** The field's path. */
  path: string;
  /** The field's first message. */
  message: string;
  /** The field's label or legend, without its mark; empty for a field the form doesn't show. */
  label: string;
  /** The field it belongs to, when the form shows one. */
  field: HTMLElement | null;
};

/** The part of a field's meta the summary reads. */
export type FieldErrors = {
  /** The field's validator results. */
  errors?: readonly unknown[];
};

/** A field's label or legend as a person reads it (its mark is drawn, not text). */
function fieldName(field: HTMLElement): string {
  const label = field.querySelector<HTMLElement>("[data-slot=field-label], [data-slot=fieldset-legend]");

  return label?.textContent.trim() ?? "";
}

function inPageOrder(left: ErrorSummaryItem, right: ErrorSummaryItem): number {
  if (left.field !== null && right.field !== null) {
    const isFollowing = (left.field.compareDocumentPosition(right.field) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

    return isFollowing ? LEFT_FIRST : RIGHT_FIRST;
  }

  if (left.field !== null) return LEFT_FIRST;

  return right.field === null ? 0 : RIGHT_FIRST;
}

/** The form's problems in the order its fields appear; fields it doesn't show come last. */
export function errorSummaryItems(
  meta: Readonly<Record<string, FieldErrors | undefined>>,
  root: QueryRoot | undefined,
): ErrorSummaryItem[] {
  const items = Object.entries(meta).flatMap(([path, entry]): ErrorSummaryItem[] => {
    const [message] = errorMessages(entry?.errors ?? []);

    if (message === undefined) return [];
    const field = root?.querySelector<HTMLElement>(`[data-field-name="${CSS.escape(path)}"]`) ?? null;

    return [{ field, label: field === null ? "" : fieldName(field), message, path }];
  });

  return items.toSorted(inPageOrder);
}

/** What `FormErrorSummary` takes. */
export type FormErrorSummaryProps = {
  /** The form's TanStack api. */
  form: AnyFormApi;
  /** The form element its fields are in. */
  root: () => HTMLElement | undefined;
  /** Shows and focuses a field's control. */
  goTo: (field: HTMLElement) => void;
  /** The summary's element, to focus it. */
  ref?: (element: HTMLDivElement) => void;
};

/** The link points at the field's control, as a page anchor would. */
function anchor(field: HTMLElement): string {
  return `#${field.querySelector("[id]")?.id ?? ""}`;
}

function itemText(item: ErrorSummaryItem): string {
  return item.label === "" ? item.message : `${item.label}: ${item.message}`;
}

function SummaryItem(props: { item: ErrorSummaryItem; goTo: (field: HTMLElement) => void }): JSX.Element {
  return (
    <li>
      <Show when={props.item.field} fallback={<span class="text-destructive">{props.item.message}</span>}>
        {(field) => (
          <a
            href={anchor(field())}
            class="text-destructive underline underline-offset-2"
            onClick={(event) => {
              event.preventDefault();
              props.goTo(field());
            }}
          >
            {itemText(props.item)}
          </a>
        )}
      </Show>
    </li>
  );
}

/** The list of a submit's problems, each a link to its field; gone once none is left. */
export function FormErrorSummary(props: FormErrorSummaryProps): JSX.Element {
  const messages = useUiMessages();
  const meta = useStore(untrack(() => props.form).store, (state) => state.fieldMeta);
  const items = createMemo(() => errorSummaryItems(meta(), props.root()));
  const titleId = createUniqueId();

  return (
    <Show when={items().length > 0}>
      <div
        ref={props.ref}
        data-slot="form-error-summary"
        role="alert"
        tabindex={FOCUS_FROM_CODE}
        aria-labelledby={titleId}
        class={SUMMARY_CLASS}
      >
        <h2 id={titleId} class="text-base font-medium text-foreground">
          {messages.errorSummaryTitle}
        </h2>
        <ul class="mt-2 flex list-none flex-col gap-1 p-0 text-sm">
          <For each={items()} keyed={(item) => item.path}>
            {(item) => <SummaryItem item={item()} goTo={props.goTo} />}
          </For>
        </ul>
      </div>
    </Show>
  );
}
