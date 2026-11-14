import { UI_MESSAGES_EN, type UiMessages } from "./messages.ts";

/** The built-in strings with `messages` over English: one getter per key, so a read tracks `messages`. */
export class TranslatedMessages implements UiMessages {
  readonly #messages: () => Partial<UiMessages> | undefined;

  /** Reads `messages()` at each access, so a language switch re-renders in place. */
  constructor(messages: () => Partial<UiMessages> | undefined) {
    this.#messages = messages;
  }

  get clear(): UiMessages["clear"] {
    return this.#messages()?.clear ?? UI_MESSAGES_EN.clear;
  }

  get close(): UiMessages["close"] {
    return this.#messages()?.close ?? UI_MESSAGES_EN.close;
  }

  get comboboxCreate(): UiMessages["comboboxCreate"] {
    return this.#messages()?.comboboxCreate ?? UI_MESSAGES_EN.comboboxCreate;
  }

  get comboboxCreateEmpty(): UiMessages["comboboxCreateEmpty"] {
    return this.#messages()?.comboboxCreateEmpty ?? UI_MESSAGES_EN.comboboxCreateEmpty;
  }

  get comboboxCreateExists(): UiMessages["comboboxCreateExists"] {
    return this.#messages()?.comboboxCreateExists ?? UI_MESSAGES_EN.comboboxCreateExists;
  }

  get comboboxCreateNew(): UiMessages["comboboxCreateNew"] {
    return this.#messages()?.comboboxCreateNew ?? UI_MESSAGES_EN.comboboxCreateNew;
  }

  get loading(): UiMessages["loading"] {
    return this.#messages()?.loading ?? UI_MESSAGES_EN.loading;
  }

  get menuFilter(): UiMessages["menuFilter"] {
    return this.#messages()?.menuFilter ?? UI_MESSAGES_EN.menuFilter;
  }

  get noResults(): UiMessages["noResults"] {
    return this.#messages()?.noResults ?? UI_MESSAGES_EN.noResults;
  }

  get optionalMark(): UiMessages["optionalMark"] {
    return this.#messages()?.optionalMark ?? UI_MESSAGES_EN.optionalMark;
  }

  get remove(): UiMessages["remove"] {
    return this.#messages()?.remove ?? UI_MESSAGES_EN.remove;
  }

  get requiredChoice(): UiMessages["requiredChoice"] {
    return this.#messages()?.requiredChoice ?? UI_MESSAGES_EN.requiredChoice;
  }

  get requiredField(): UiMessages["requiredField"] {
    return this.#messages()?.requiredField ?? UI_MESSAGES_EN.requiredField;
  }

  get requiredText(): UiMessages["requiredText"] {
    return this.#messages()?.requiredText ?? UI_MESSAGES_EN.requiredText;
  }

  get requiredTick(): UiMessages["requiredTick"] {
    return this.#messages()?.requiredTick ?? UI_MESSAGES_EN.requiredTick;
  }

  get textTooLong(): UiMessages["textTooLong"] {
    return this.#messages()?.textTooLong ?? UI_MESSAGES_EN.textTooLong;
  }

  get viewEmpty(): UiMessages["viewEmpty"] {
    return this.#messages()?.viewEmpty ?? UI_MESSAGES_EN.viewEmpty;
  }

  get viewNo(): UiMessages["viewNo"] {
    return this.#messages()?.viewNo ?? UI_MESSAGES_EN.viewNo;
  }

  get viewYes(): UiMessages["viewYes"] {
    return this.#messages()?.viewYes ?? UI_MESSAGES_EN.viewYes;
  }
}
