import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import { cn } from "../../../../utils/cn/index.ts";
import { Button } from "../../../button/index.ts";
import { useUiLocale, useUiMessages } from "../../../provider/index.ts";
import { useFormUnsaved } from "./form-unsaved.tsx";

/** What `FormDraftNotice` takes. */
export type FormDraftNoticeProps = {
  /** Extra classes for the notice. */
  class?: string;
};

const NOTICE = "flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm";

const TODAY: Intl.DateTimeFormatOptions = { timeStyle: "short" };
const OTHER_DAY: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

/** When a draft was saved: the time today, else the date and time. */
function savedTime(saved: number, locale: string): string {
  const isToday = new Date(saved).toDateString() === new Date().toDateString();
  const style = isToday ? TODAY : OTHER_DAY;

  return new Intl.DateTimeFormat(locale, style).format(saved);
}

/**
 * Its Form's draft notice: the changes it restored and when, with Discard, or that another tab is
 * editing the same draft. Put it at the top of the Form, inside FormUnsaved with a `draftKey`.
 */
export function FormDraftNotice(props: FormDraftNoticeProps): JSX.Element {
  const messages = useUiMessages();
  const locale = useUiLocale();
  const state = useFormUnsaved("FormDraftNotice");

  function isElsewhere(): boolean {
    return state.draft?.elsewhere() === true;
  }

  function restoredAt(): number | undefined {
    return isElsewhere() ? undefined : state.draft?.restoredAt();
  }

  return (
    <output data-slot="form-draft-notice" class={cn("contents", props.class)}>
      <Show when={isElsewhere()}>
        <p class={NOTICE}>{messages.draftElsewhere}</p>
      </Show>
      <Show when={restoredAt()}>
        {(saved) => (
          <div class={NOTICE}>
            <span>{messages.draftRestored(savedTime(saved(), locale()))}</span>
            <Button variant="ghost" size="sm" type="button" onClick={state.discard}>
              {messages.draftDiscard}
            </Button>
          </div>
        )}
      </Show>
    </output>
  );
}
