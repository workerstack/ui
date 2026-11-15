import { isServer } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";

import { fileDropState } from "./file-drop-state.ts";
import type { FileDrop, FileDropOptions, Zone } from "./file-drop.types.ts";
import { FILE_DRAG_TYPES, handleFileDrag, pointAt } from "./handle-file-drag.ts";

/** Does nothing: the server's ref. */
function noop(): void {
  // Nothing to bind on the server.
}

/** Adds or removes the window listeners every zone shares. */
function listenAll(how: "add" | "remove"): void {
  for (const type of FILE_DRAG_TYPES) {
    if (how === "add") addEventListener(type, handleFileDrag, true);
    else removeEventListener(type, handleFileDrag, true);
  }
}

/** Creates a zone that takes files dropped from the operating system. */
export function createFileDrop(options: FileDropOptions): FileDrop {
  const [over, setOver] = createSignal(false, { ownedWrite: true });
  const [dragging, setDragging] = createSignal(false, { ownedWrite: true });

  if (isServer) return { dragging, over, ref: noop };
  const zone: Zone = { options, setDragging, setOver };
  let el: HTMLElement | undefined;

  onCleanup(() => {
    const state = fileDropState();

    if (el === undefined) return;

    if (state.current === zone) pointAt(undefined);
    state.zones.delete(el);
    el.removeAttribute("data-file-drop");

    if (state.zones.size === 0) listenAll("remove");
  });

  return {
    dragging,
    over,
    ref: (element) => {
      const { zones } = fileDropState();
      el = element;

      if (zones.size === 0) listenAll("add");
      element.setAttribute("data-file-drop", "");
      zones.set(element, zone);
    },
  };
}
