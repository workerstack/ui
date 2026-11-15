import { fileDropState } from "./file-drop-state.ts";
// Window listeners run while any zone is mounted. Only drags carrying files count, so text drags and native file
// inputs outside every zone behave as the browser makes them.
import { DRAG_END, DRAG_ENTER, DRAG_LEAVE, DROP, FILE, FILES } from "./file-drop.constants.ts";
import type { Zone } from "./file-drop.types.ts";
import { filesOf } from "./files-of.ts";

const ZONE = "[data-file-drop]";

/** The drag events a zone listens to on the window. */
export const FILE_DRAG_TYPES = ["dragenter", "dragover", "dragleave", "drop", "dragend"] as const;

/** The closest enabled zone around `target`. */
function zoneAt(target: EventTarget | null): Zone | undefined {
  const { zones } = fileDropState();
  let el = target instanceof Element ? target.closest(ZONE) : null;

  while (el !== null) {
    const zone = zones.get(el);

    if (zone !== undefined && zone.options.disabled?.() !== true) return zone;
    el = el.parentElement?.closest(ZONE) ?? null;
  }

  return undefined;
}

/** Marks `zone` as the one the files are over. */
export function pointAt(zone: Zone | undefined): void {
  const state = fileDropState();

  if (state.current === zone) return;
  state.current?.setOver(false);
  state.current = zone;
  zone?.setOver(true);
}

/** The drag left the window or ended: nothing is over or dragging. */
function reset(): void {
  const state = fileDropState();
  state.depth = 0;
  pointAt(undefined);

  for (const zone of state.zones.values()) zone.setDragging(false);
}

/** Counts enters and leaves over the window; true when the event is done with. */
function track(type: string): boolean {
  const state = fileDropState();

  if (type === DRAG_LEAVE) {
    state.depth--;

    if (state.depth <= 0) reset();

    return true;
  }

  if (type === DRAG_END) {
    reset();

    return true;
  }

  if (type === DRAG_ENTER && state.depth++ === 0) for (const zone of state.zones.values()) zone.setDragging(true);

  return false;
}

/** A drag of files over the page: it shows a copy over a zone, and no drop elsewhere. */
function hover(data: DataTransfer, zone: Zone | undefined): void {
  data.dropEffect = zone === undefined ? "none" : "copy";
  pointAt(zone);
}

/** A drop of files: an enabled zone around the target takes them. */
function drop(data: DataTransfer, zone: Zone | undefined): void {
  reset();
  const files = zone === undefined ? [] : filesOf(data);

  if (files.length > 0) zone?.options.onDrop(files);
}

/** Handles a drag event carrying files: enter, over, leave, drop, end. */
export function handleFileDrag(event: DragEvent): void {
  const data = event.dataTransfer;
  const { target, type } = event;

  if (data?.types.includes(FILES) !== true || track(type)) return;
  const zone = zoneAt(target);
  const isOwnInput = zone === undefined && target instanceof HTMLInputElement && target.type === FILE;

  // The browser's own drop onto a native file input outside every zone still happens.
  if (isOwnInput) return type === DROP ? reset() : pointAt(undefined);
  event.preventDefault();

  if (type === DROP) drop(data, zone);
  else hover(data, zone);
}
