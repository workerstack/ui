import { cleanup, render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { required } from "../../test/required.ts";
import { BUTTON_MESSAGES_EN } from "../button/button.messages.ts";
import { ARRAY_MESSAGES_EN } from "../form/tanstack/array/array.messages.ts";
import { FORM_SAVE_BAR_MESSAGES_EN } from "../form/tanstack/unsaved/form-save-bar.messages.ts";
import { type UiMessages, UiProvider, useUiMessages } from "./index.ts";

afterEach(cleanup);

/** A part's English, and a translation of every key of it. */
const SLICES: [name: string, english: Partial<UiMessages>, translated: Partial<UiMessages>][] = [
  ["ButtonMessages", BUTTON_MESSAGES_EN, { loading: "Učitavanje" }],
  [
    "FormSaveBarMessages",
    FORM_SAVE_BAR_MESSAGES_EN,
    { saveBarDiscard: "a", saveBarDiscardDescription: "b", saveBarDiscardTitle: "c", saveBarSave: "d" },
  ],
  [
    "ArrayMessages",
    ARRAY_MESSAGES_EN,
    {
      arrayCanceled: () => "a",
      arrayDropped: () => "b",
      arrayItem: () => "c",
      arrayLifted: () => "d",
      arrayMoveDown: () => "e",
      arrayMoveUp: () => "f",
      arrayRemove: () => "g",
    },
  ],
];

it.each(SLICES)("translates every key of %s and falls back to English for the rest", (_name, english, translated) => {
  expect(Object.keys(translated).toSorted()).toStrictEqual(Object.keys(english).toSorted());

  const [messages, setMessages] = createSignal<Partial<UiMessages>>(translated);
  let read: Partial<UiMessages> | undefined;
  render(() => (
    <UiProvider messages={messages()}>
      {(() => {
        read = useUiMessages(english);

        return null;
      })()}
    </UiProvider>
  ));
  const strings = required(read, "the provider's strings");
  expect(Object.entries(strings)).toStrictEqual(Object.entries(translated));
  setMessages({});
  flush();
  expect(Object.entries(strings)).toStrictEqual(Object.entries(english));
});
