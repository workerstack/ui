import type { JSX } from "@solidjs/web";
import { createSignal, Show } from "solid-js";

import { cn } from "../../../../utils/cn/index.ts";
import { Badge, badgeClass } from "../../../badge/index.ts";
import { Button } from "../../../button/index.ts";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../../../popover/index.ts";
import { useUiLocale, useUiMessages } from "../../../provider/index.ts";
import { FORM_UNSAVED_STATUS_MESSAGES_EN } from "./form-unsaved-status.messages.ts";
import { useFormUnsaved, type FormUnsavedState } from "./form-unsaved.tsx";
import { relativeTime, useNow } from "./relative-time.ts";
import { UNSAVED_MESSAGES_EN } from "./unsaved.messages.ts";

/** What `FormUnsavedStatus` takes. */
export type FormUnsavedStatusProps = {
  /** Extra classes for the status. */
  class?: string;
};

/** A kept draft's time, opening what that means, with Discard changes. */
function DraftSaved(props: { state: FormUnsavedState; time: number }): JSX.Element {
  const messages = useUiMessages(FORM_UNSAVED_STATUS_MESSAGES_EN);
  const locale = useUiLocale();
  const now = useNow();
  // Written by the popover and its Discard button.
  const [isOpen, setOpen] = createSignal(false, { ownedWrite: true });

  function discard(): void {
    setOpen(false);
    props.state.discard();
  }

  return (
    <Popover open={isOpen()} onOpenChange={setOpen}>
      <PopoverTrigger data-slot="form-draft-saved" class={cn(badgeClass({ variant: "outline" }), "cursor-pointer")}>
        {messages.draftSaved(relativeTime(props.time, now(), locale()))}
      </PopoverTrigger>
      <PopoverContent side="top" align="start" class="flex flex-col gap-3">
        <PopoverHeader>
          <PopoverTitle>{messages.draftInfoTitle}</PopoverTitle>
          <PopoverDescription>{messages.draftInfoDescription}</PopoverDescription>
        </PopoverHeader>
        <Button variant="outline" size="sm" type="button" class="w-fit" onClick={discard}>
          {messages.draftDiscardChanges}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Its Form's unsaved state, beside Save: "Unsaved changes" while it differs from where it started,
 * or, for a form that keeps a draft, "Saved on this device · 2 minutes ago", which opens what that
 * means and a Discard. Shows nothing while the form is unchanged. Sits inside FormUnsaved.
 */
export function FormUnsavedStatus(props: FormUnsavedStatusProps): JSX.Element {
  const messages = useUiMessages(UNSAVED_MESSAGES_EN);
  const state = useFormUnsaved("FormUnsavedStatus");

  function savedAt(): number | undefined {
    return state.changed() && state.policy() === "draft" ? state.draft?.savedAt() : undefined;
  }

  return (
    <output data-slot="form-unsaved-status" class={cn("inline-flex items-center text-sm", props.class)}>
      <Show
        when={savedAt()}
        fallback={
          <Show when={state.changed()}>
            <Badge variant="secondary">{messages.unsavedChanges}</Badge>
          </Show>
        }
      >
        {(time) => <DraftSaved state={state} time={time()} />}
      </Show>
    </output>
  );
}
