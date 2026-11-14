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
