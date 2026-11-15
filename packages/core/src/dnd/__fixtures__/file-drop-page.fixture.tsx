import "./list.fixture.css";
import "./tree.fixture.css";

import { createSignal } from "solid-js";

import { createFileDrop } from "../file-drop/index.ts";

/** A drop zone, a disabled zone, and a native file input outside both. Ported from the monorepo's harness. */
export function FileDropPage() {
  const [names, setNames] = createSignal<string[]>([]);
  const zone = createFileDrop({ onDrop: (files) => setNames(files.map((file) => file.name)) });
  const off = createFileDrop({ disabled: () => true, onDrop: () => setNames(["wrong"]) });
  return (
    <div>
      <div ref={zone.ref} class="drop-zone" data-testid="zone" data-over={zone.over() ? "" : undefined}>
        Drop files here
      </div>
      <div ref={off.ref} class="drop-zone" data-testid="disabled-zone">
        Disabled zone
      </div>
      <label>
        Native input <input type="file" data-testid="native" />
      </label>
      <p data-testid="outside">
        dragging: <output data-testid="dragging">{String(zone.dragging())}</output>, over:{" "}
        <output data-testid="over">{String(zone.over())}</output>
      </p>
      <p>
        dropped: <output data-order="files">{names().join(",")}</output>
      </p>
    </div>
  );
}

/** A drag's data carrying text files with these names. */
export function filesTransfer(names: string[]): DataTransfer {
  const data = new DataTransfer();
  for (const name of names) data.items.add(new File(["x"], name, { type: "text/plain" }));
  return data;
}

/** A drag's data carrying only text. */
export function textTransfer(text: string): DataTransfer {
  const data = new DataTransfer();
  data.setData("text/plain", text);
  return data;
}

/**
 * Dispatches a drag event of `type` carrying `data` on `target`; returns whether it was prevented. OS file drops are
 * the one exception to real input: no browser driver drags a file from the desktop. Chromium ignores drop effect writes
 * on a synthetic DataTransfer, so the effect is not read.
 */
export function fireDrag(target: Element, type: string, data: DataTransfer): boolean {
  const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data });
  target.dispatchEvent(event);
  return event.defaultPrevented;
}
