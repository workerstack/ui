/** The id of the hidden element keyboard handles are described by. */
const INSTRUCTIONS_ID = "dnd-instructions";

/** The hidden instructions element keyboard handles point at, with `text` in it; returns its id. */
export function instructions(text: string): string {
  let el = document.querySelector<HTMLElement>(`#${INSTRUCTIONS_ID}`);

  if (el === null) {
    el = document.createElement("div");
    el.id = INSTRUCTIONS_ID;
    el.hidden = true;
    document.body.append(el);
  }

  if (el.textContent !== text) el.textContent = text;

  return INSTRUCTIONS_ID;
}
