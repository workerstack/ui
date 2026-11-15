// Files dropped from the operating system. Standalone: it imports nothing else in the package.

/** What a file drop zone is told by the app. */
export type FileDropOptions = {
  /** Takes the dropped files; folders are left out. */
  onDrop: (files: File[]) => void;
  /** True while the zone takes no drops. */
  disabled?: () => boolean;
};

/** A file drop zone's binding and state. */
export type FileDrop = {
  /** On the zone element. */
  ref: (element: HTMLElement) => void;
  /** Files are over this zone. */
  over: () => boolean;
  /** Files are being dragged anywhere over the window. */
  dragging: () => boolean;
};

/** The drop data `filesOf` reads: a `DataTransfer` is one. */
export type DroppedItems = {
  /** The dropped items. */
  items: Iterable<{
    /** "file" for a file or a folder; anything else is left out. */
    kind: string;
    /** The file, or null when the item has none. */
    getAsFile: () => File | null;
    /** The entry behind the item, where the browser has one: folders are left out. */
    webkitGetAsEntry?: () => {
      /** True for a folder. */
      isDirectory: boolean;
    } | null;
  }>;
};

/** One mounted zone. */
export type Zone = {
  options: FileDropOptions;
  setOver: (over: boolean) => void;
  setDragging: (dragging: boolean) => void;
};
