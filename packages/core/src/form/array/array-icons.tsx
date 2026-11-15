import type { JSX } from "@solidjs/web";

// The array's icons, drawn as the theme draws ours: a `data-icon` mask over currentColor. UI SDK
// has a chevron and an x; the grip, which it has not, is our own mask image.

/** Six dots in two columns: the grip of a drag handle. */
const GRIP =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E" +
  "%3Ccircle cx='9' cy='5' r='1.75'/%3E%3Ccircle cx='9' cy='12' r='1.75'/%3E%3Ccircle cx='9' cy='19' r='1.75'/%3E" +
  "%3Ccircle cx='15' cy='5' r='1.75'/%3E%3Ccircle cx='15' cy='12' r='1.75'/%3E%3Ccircle cx='15' cy='19' r='1.75'/%3E" +
  '%3C/svg%3E")';

const CHEVRON = "inline-flex [--ui-icon:var(--ui-icon-chevron)] [--ui-icon-size:1rem]";

/** The grip a Handle shows. */
export function GripIcon(): JSX.Element {
  return <span data-icon="grip" aria-hidden="true" class="inline-flex" style={{ "--ui-icon": GRIP }} />;
}

/** A chevron pointing up (MoveUp) or down (MoveDown). */
export function ChevronIcon(props: { up: boolean }): JSX.Element {
  return <span data-icon="chevron" aria-hidden="true" class={props.up ? `${CHEVRON} rotate-180` : CHEVRON} />;
}

/** The x a Remove shows. */
export function RemoveIcon(): JSX.Element {
  return <span data-icon="x" aria-hidden="true" class="inline-flex" />;
}
