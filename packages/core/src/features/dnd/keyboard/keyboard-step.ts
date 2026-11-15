import type { ListState } from "../engine/engine.types.ts";
import type { KeySession } from "../engine/keyboard.types.ts";
import type { Direction } from "../geometry/geometry.types.ts";
import { insertionAt, span } from "../geometry/list-index.ts";
import { neighbor } from "../geometry/pick-list.ts";
import { current } from "../scroll/scroll-position.ts";
import { arrowDirection } from "./arrow-direction.ts";
import { keyOrder, range } from "./key-order.ts";

/** Where the gap goes: a list and an index in it. */
type Spot = { list: ListState; index: number };

/** The first allowed index of `list` in `order`, skipping where the gap is now. */
function firstAllowed(session: KeySession, list: ListState, order: readonly number[]): number | undefined {
  const here = session.target();

  return order.find((i) => (list !== here || i !== list.index) && session.allowed(list, i));
}

/** A neighbor list's indexes, nearest the dragged item first. */
function entryOrder(session: KeySession, list: ListState): number[] {
  const box = span(session.box(), list);
  const spans = list.boxes.map((other) => span(current(other.rect, list.chain), list));
  const entry = insertionAt(spans, (box.start + box.end) / 2);

  return range(list.boxes.length + 1, (k) => k).toSorted((a, b) => Math.abs(a - entry) - Math.abs(b - entry));
}

/**
 * Past the list's end, or across its axis: the nearest list that way, entered at the slot nearest the item. A list
 * with no allowed position is passed over.
 */
function across(session: KeySession, direction: Direction): Spot | undefined {
  const lists = session.lists();
  const rects = lists.map((list) => session.visible(list));
  let at = lists.indexOf(session.target());

  for (;;) {
    at = neighbor(rects, at, direction);
    const list = lists[at];

    if (list === undefined) return undefined;
    const index = firstAllowed(session, list, entryOrder(session, list));

    if (index !== undefined) return { index, list };
  }
}

/** Where `key` moves the gap: within the list, or on into the nearest list that way. */
function destination(session: KeySession, key: string): Spot | undefined {
  const list = session.target();
  const direction = arrowDirection(key);
  const index = firstAllowed(session, list, keyOrder(list, key, direction));

  if (index !== undefined) return { index, list };

  return direction === undefined || session.lists().length <= 1 ? undefined : across(session, direction);
}

/** Moves the gap one step for `key` and says where the item is, or that it can't move. */
export function keyboardStep(session: KeySession, key: string): void {
  session.remeasure();
  const spot = destination(session, key);
  const { messages } = session;

  if (spot === undefined) return session.say(messages.noMove(session.name()));
  const { list, index } = spot;
  session.place(list, index);
  session.say(
    messages.moved({
      item: session.name(),
      list: list.reg.label?.(),
      position: index + 1,
      total: list.boxes.length + 1,
    }),
  );
}
