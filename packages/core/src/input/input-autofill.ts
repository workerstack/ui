/** What `inputOnLoneChange` gives a text box. */
export type LoneChange = {
  /** Call from the box's `input` handler: remembers the value an input reported. */
  input: (event: Event) => void;
  /** Call from the box's `change` handler: turns a change no input reported into one. */
  change: (event: Event) => void;
};

/** An event's target as a text box, or null when it is anything else. */
function textField(target: EventTarget | null): HTMLInputElement | HTMLTextAreaElement | null {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target : null;
}

/**
 * Lets a fill that sends only `change` (no `input`: some password managers and engines) reach
 * whatever listens to `input`. UI SDK hears typing through `input`, so without this the fill would
 * never reach its value, `onValueChange` or the Field's validity. A change to a value no input
 * reported dispatches the `input` a fill sends, as `insertReplacementText`.
 */
export function inputOnLoneChange(): LoneChange {
  let last: string | undefined;

  return {
    change(event) {
      const element = textField(event.currentTarget);

      if (element === null || element.value === last) return;
      last = element.value;
      element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertReplacementText" }));
    },
    input(event) {
      const element = textField(event.currentTarget);

      if (element !== null) last = element.value;
    },
  };
}
