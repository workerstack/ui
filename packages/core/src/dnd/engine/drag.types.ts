import type { Point, Rect } from "../geometry/geometry.types.ts";
import type { DndMessages } from "../messages/dnd-messages.ts";
import type { Ledger } from "../motion/ledger.ts";
import type { AutoScrollState } from "../scroll/auto-scroll.ts";
import type { Scroller } from "../scroll/scroll.types.ts";
import type {
  ActiveDrag,
  ExpanderReg,
  ItemReg,
  ListState,
  PlacedItem,
  PlacedList,
  SortableMove,
} from "./engine.types.ts";
import type { KeyboardMode } from "./keyboard.types.ts";

/** What the engine is told by the sortable it runs for. */
export type EngineOptions = {
  /** Applies a committed move to the app's data, synchronously. */
  onMove: (move: SortableMove) => void;
  /** False blocks a destination. */
  canMove?: (move: SortableMove) => boolean;
  /** A drag started on the item with this id. */
  onDragStart?: (id: string) => void;
  /** A drag ended: the move, or null when canceled. */
  onDragEnd?: (move: SortableMove | null) => void;
  /** Ids are positions: the commit leaves elements in place with new content, so no FLIP. */
  positional?: boolean;
  /** Keyboard lift mode; without it, drags start by pointer only. */
  keyboard?: KeyboardMode;
  /** The strings to speak. */
  messages: DndMessages;
  /** Reports the drag to the sortable's `active()`. */
  setActive: (active: ActiveDrag | null) => void;
};

/** Everything one engine has registered, and the drag it runs. */
export type Registry = {
  /** The sortable's options. */
  options: EngineOptions;
  /** Lists by element. */
  lists: Map<HTMLElement, PlacedList>;
  /** Items by element. */
  items: Map<HTMLElement, PlacedItem>;
  /** Items by id, for focus and FLIP after a commit. */
  byId: Map<string, ItemReg>;
  /** Expanders. */
  expanders: Set<ExpanderReg>;
  /** The drag this engine runs, from lift until its commit. */
  drag?: Drag | undefined;
};

/** A press that starts a drag: what it started from, where, and with which pointer (null for the keyboard). */
export type Press = { activator: HTMLElement; point: Point; pointerId: number | null };

/** Where a drag ends: the list and index of the gap, and whether it drops there or cancels. */
export type Landing = { list: ListState; index: number; isDrop: boolean };

/** What a drag reads at lift, before any list is measured. */
export type LiftBase = {
  /** The dragged item. */
  item: PlacedItem;
  /** Its border box at lift. */
  lift: Rect;
  /** Its margins. */
  margin: { top: number; right: number; bottom: number; left: number };
  /** In-place mode: the element stays in flow (table columns and rows). */
  inPlace: boolean;
  /** Scrollers shared by every list of the drag. */
  cache: Map<Element, Scroller>;
};

/** One drag, from lift until its commit. */
export type Drag = LiftBase & {
  registry: Registry;
  options: EngineOptions;
  el: HTMLElement;
  activator: HTMLElement;
  home: PlacedList;
  /** The item's index at home. */
  from: number;
  /** The home list's items at lift, the dragged one included. */
  regs: PlacedItem[];
  /** The pointer that drags; null for the keyboard. */
  pointerId: number | null;
  reduced: boolean;
  ledger: Ledger;
  modal: Element | undefined;
  /** Focus was in the activator at lift. */
  focused: boolean;
  /** Inline values copied before the lift, so the browser's popover styles change nothing. */
  reset: Record<string, string>;
  followers: HTMLElement[];
  /** The home list's state; it keeps its identity across relayouts. */
  homeState: ListState;
  states: ListState[];
  /** The list the gap is in; null outside every list. */
  target: ListState | null;
  /** Expanders a drag can rest on: where each is and since when the pointer rests (`OPENED` once opened). */
  expanding: Map<ExpanderReg, { rect: Rect; chain: Scroller[]; since: number }>;
  /** The pointer at lift. */
  point: Point;
  /** The latest pointer. */
  pointer: Point;
  /** The dragged element's translate. */
  translate: Point;
  blocked: boolean;
  phase: "dragging" | "dropping";
  /** The last state reported to `setActive`. */
  reported: string;
  /** Displaced items transition (one frame after lift). */
  transitions: boolean;
  /** `canMove` answers by list and index. */
  allowed: Map<string, boolean>;
  /** Cleanups that run when the drag ends. */
  offs: (() => void)[];
  /** Layout changed: the next frame or key measures again. */
  changed: boolean;
  scrollDirty: boolean;
  frame: number;
  lastTime: number;
  scroll: AutoScrollState;
  /** Containers of hidden lists, watched for growing. */
  watched: Set<Element>;
  /** Watches the containers of hidden lists, made once the first is found. */
  resizes?: ResizeObserver;
  /** The resize observer has given its first report. */
  primed: boolean;
  /** Finishes a running drop animation now. */
  finishDrop?: (() => void) | undefined;
};
