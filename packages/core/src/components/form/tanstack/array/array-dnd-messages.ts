import { defaultMessages } from "../../../../features/dnd/messages/dnd-messages.ts";
import type { DndMessages } from "../../../../features/dnd/sortable/core/index.ts";
import type { UiMessages } from "../../../provider/index.ts";

/**
 * What the array's drags speak, from the provider's strings, read when spoken so a language switch
 * follows. A form array is one list dragged by pointer only (its move buttons are the keyboard
 * path) with no refused destinations, so it only lifts, drops and cancels: the keyboard, cross-list
 * and tree strings never speak and keep the engine's own.
 */
export function arrayDndMessages(messages: UiMessages): DndMessages {
  return {
    ...defaultMessages,
    canceled: (item, position) => messages.arrayCanceled(item, position),
    dropped: (spot) => messages.arrayDropped(spot),
    lifted: (spot) => messages.arrayLifted(spot),
  };
}
