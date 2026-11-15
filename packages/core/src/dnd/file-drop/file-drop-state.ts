import type { Zone } from "./file-drop.types.ts";

/** The document's zones and the drag over them. */
export type FileDropState = {
  /** Mounted zones by element. */
  zones: Map<Element, Zone>;
  /** Enters minus leaves over the window: Safari's `relatedTarget` is always null on leaves. */
  depth: number;
  /** The zone the files are over. */
  current: Zone | undefined;
};

/** Where the document keeps the state, so every copy of this module shares it. */
type StateHolder = { workerstackFileDrop?: FileDropState };

/** The document's file drop state, created on first use. */
export function fileDropState(): FileDropState {
  const holder: StateHolder = document /* the document carries one extra property */ as StateHolder;
  holder.workerstackFileDrop ??= { current: undefined, depth: 0, zones: new Map() };

  return holder.workerstackFileDrop;
}
