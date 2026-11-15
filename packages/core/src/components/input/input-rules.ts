import { createTextRules, isInputElement, type RefLike } from "../../internal/index.ts";
import { VALIDITY_MESSAGES_EN } from "../../internal/validity.messages.ts";
import { useUiMessages } from "../provider/index.ts";
import { inputOnLoneChange, type LoneChange } from "./input-autofill.ts";

/** What `createInputRules` reads from an Input's props. */
export type InputRulesProps = {
  /** The consumer's own `ref`. */
  ref?: RefLike<HTMLInputElement> | undefined;
  /** The controlled value. */
  value?: string | undefined;
  /** Whether the input is required. */
  required?: boolean | "" | undefined;
  /** The most characters a person sees. */
  maxLength?: number | undefined;
};

// Checks the rules after each input and each change, and lets a lone change reach the value.
function listen(element: HTMLInputElement, hooks: { relay: LoneChange; sync: () => void }): void {
  element.addEventListener("input", (event) => {
    hooks.sync();
    hooks.relay.input(event);
  });
  element.addEventListener("change", (event) => {
    hooks.sync();
    hooks.relay.change(event);
  });
}

/**
 * What every Input does with its text besides showing it: `required` counts blank text as missing,
 * `maxLength` counts graphemes, and a fill that sends only `change` reaches the value. Returns the
 * `ref` to give the input, which also calls the consumer's own. The rules listen on the element, so
 * the consumer's `onInput` and `onChange` stay theirs.
 */
export function createInputRules(props: InputRulesProps): (element: HTMLInputElement | null) => void {
  const messages = useUiMessages(VALIDITY_MESSAGES_EN);
  const relay = inputOnLoneChange();

  const rules = createTextRules(props, isInputElement, messages);

  return (element) => {
    rules.ref(element);

    if (element !== null) listen(element, { relay, sync: rules.sync });
  };
}
