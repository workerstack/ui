import { useUiLocale, useUiMessages } from "../index.ts";

/** Shows the built-in strings and the format locale the nearest provider gives. */
export function ProviderProbe() {
  const messages = useUiMessages();
  const locale = useUiLocale();

  return (
    <output>
      <span data-testid="clear">{messages.clear}</span>
      <span data-testid="close">{messages.close}</span>
      <span data-testid="locale">{locale()}</span>
    </output>
  );
}

/** Shows the strings a combobox reads: a plain one and one that takes the typed label. */
export function ComboboxMessagesProbe() {
  const messages = useUiMessages();

  return (
    <output>
      <span data-testid="no-results">{messages.noResults}</span>
      <span data-testid="create">{messages.comboboxCreate("Design")}</span>
    </output>
  );
}

/** Shows a plain required-field string and the text-too-long string, which takes a length and a limit. */
export function ValidityMessagesProbe() {
  const messages = useUiMessages();

  return (
    <output>
      <span data-testid="required-field">{messages.requiredField}</span>
      <span data-testid="too-long">{messages.textTooLong(12, 10)}</span>
    </output>
  );
}
