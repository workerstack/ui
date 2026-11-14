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
