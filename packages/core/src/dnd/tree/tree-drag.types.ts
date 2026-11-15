import type { Point } from "../geometry/geometry.types.ts";
import type { Ledger } from "../motion/ledger.ts";
import type { AutoScrollState } from "../scroll/auto-scroll.ts";
import type { Scroller } from "../scroll/scroll.types.ts";
import type { ElementRow } from "./tree-dom.ts";
import type { TreeMove, TreePlace } from "./tree.types.ts";

/** One tree drag, from lift until it ends. */
export type TreeDrag = {
  tree: HTMLElement;
  /** The dragged row's id. */
  id: string;
  modal: Element | undefined;
  isRtl: boolean;
  chain: Scroller[];
  scroll: AutoScrollState;
  /** The rows in play: the visible ones, in content coordinates. */
  rows: ElementRow[];
  /** The dragged row's index in `rows`. */
  s: number;
  source: ElementRow;
  from: TreePlace;
  /** The dragged row and its descendants. */
  subtree: ElementRow[];
  /** Styles this drag wrote. */
  ledger: Ledger;
  /** The pointer at lift. */
  point: Point;
  /** The latest pointer. */
  pointer: Point;
  /** The move a drop makes now; null where it changes nothing. */
  move: TreeMove | null;
  blocked: boolean;
  /** The row taking an "inside" drop. */
  target: HTMLElement | null;
  /** The collapsed branch the pointer rests in, and since when (`OPENED` once opened). */
  hover: { id: string; since: number } | null;
  /** Rows changed: the next frame measures again. */
  dirty: boolean;
  last: number;
  frame: number;
  offs: (() => void)[];
};
