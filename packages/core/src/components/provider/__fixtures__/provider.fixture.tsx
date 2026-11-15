import { CLEAR_MESSAGES_EN } from "../../../internal/clear.messages.ts";
import { CLOSE_MESSAGES_EN } from "../../../internal/close.messages.ts";
import { NO_RESULTS_MESSAGES_EN } from "../../../internal/no-results.messages.ts";
import { VALIDITY_MESSAGES_EN } from "../../../internal/validity.messages.ts";
import { COMBOBOX_CREATE_MESSAGES_EN } from "../../combobox/combobox-create.messages.ts";
import { useUiLocale, useUiMessages } from "../index.ts";

/** Shows the built-in strings and the format locale the nearest provider gives. */
export function ProviderProbe() {
  const messages = useUiMessages(CLEAR_MESSAGES_EN);
  const closing = useUiMessages(CLOSE_MESSAGES_EN);
  const locale = useUiLocale();

  return (
    <output>
      <span data-testid="clear">{messages.clear}</span>
      <span data-testid="close">{closing.close}</span>
      <span data-testid="locale">{locale()}</span>
    </output>
  );
}

/** Shows the strings a combobox reads: a plain one and one that takes the typed label. */
export function ComboboxMessagesProbe() {
  const messages = useUiMessages(COMBOBOX_CREATE_MESSAGES_EN);
  const empty = useUiMessages(NO_RESULTS_MESSAGES_EN);

  return (
    <output>
      <span data-testid="no-results">{empty.noResults}</span>
      <span data-testid="create">{messages.comboboxCreate("Design")}</span>
    </output>
  );
}

/** Shows a plain required-field string and the text-too-long string, which takes a length and a limit. */
export function ValidityMessagesProbe() {
  const messages = useUiMessages(VALIDITY_MESSAGES_EN);

  return (
    <output>
      <span data-testid="required-field">{messages.requiredField}</span>
      <span data-testid="too-long">{messages.textTooLong(12, 10)}</span>
    </output>
  );
}
