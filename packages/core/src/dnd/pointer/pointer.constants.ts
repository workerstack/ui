/** What can take focus: a keyboard lift binds to the activator, or a whole item's first one. */
export const FOCUSABLE = "button, a[href], input, select, textarea, [tabindex]";

/** Presses inside these never start a drag, unless the element is the activator itself. */
export const INTERACTIVE: string =
  "input,textarea,select,option,button,video,audio,[contenteditable]:not([contenteditable=false]),[data-dnd-ignore]," +
  "[role=button],[role=checkbox],[role=switch],[role=radio],[role=slider],[role=spinbutton]," +
  "[role=textbox],[role=combobox],[role=menuitem],[role=tab],[role=option]";

/** Pixels of travel that turn a press into a drag. */
export const THRESHOLD = 5;

/** How long a touch on a whole item holds before it drags, so a swipe still scrolls the page. */
export const LONG_PRESS_MS = 250;
