type TextControl = HTMLInputElement | HTMLTextAreaElement;

type BlurEvent = { currentTarget: TextControl };

type CleanOnBlurOptions<Event extends BlurEvent> = {
  /** Returns the text as stored for the text the person left in the box. */
  clean: (text: string) => string;
  /** The user's blur handler; runs after the text is cleaned. */
  onBlur: ((event: Event) => void) | undefined;
};

function store(element: TextControl, text: string): void {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;

  // Writes through the prototype's setter, as the browser does for typing, so UI SDK tells the edit
  // from a code write; then `input` reports it.
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, text);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * A blur handler for a text input or textarea. It cleans the text and, when that changes it, stores
 * it as an edit (`input` fires and a controlled value updates). A read-only control is left as it
 * is. Then it calls the user's `onBlur`.
 */
export function cleanOnBlur<Event extends BlurEvent>(options: CleanOnBlurOptions<Event>): (event: Event) => void {
  return (event) => {
    const element = event.currentTarget;
    const cleaned = options.clean(element.value);

    if (!element.readOnly && cleaned !== element.value) store(element, cleaned);
    options.onBlur?.(event);
  };
}
