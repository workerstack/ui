import "./list.fixture.css";

import type { JSX } from "@solidjs/web";
import { createSignal, For, untrack } from "solid-js";

import { defaultMessages } from "../messages/dnd-messages.ts";
import { createSortable as createCore } from "../sortable/core/index.ts";
import { createSortable, move, type SortableMove } from "../sortable/index.ts";

/** One harness entry. */
export type HarnessEntry = {
  id: string;
  /** Extra height in px, for variable sizes. */
  tall?: number;
  disabled?: boolean;
};

/** The options of one harness list. */
export type HarnessListProps = {
  id: string;
  entries: HarnessEntry[];
  axis?: "x" | "y" | "grid";
  handles?: boolean;
  /** Whole items that hold only a link: they lift from the link. */
  links?: boolean;
  /** Built on `sortable/core` without the keyboard plug-in: pointer only. */
  core?: boolean;
  keyboard?: boolean;
  class?: string;
  itemClass?: string;
  label?: string;
  canMove?: (move: SortableMove) => boolean;
};

/** The sortable of a harness list, default or core. */
function sortableOf(props: HarnessListProps, setOrder: (fn: (list: HarnessEntry[]) => HarnessEntry[]) => void) {
  const [outcome, setOutcome] = createSignal("");
  const options = {
    canMove: untrack(() => props.canMove),
    onDragEnd: (result: SortableMove | null) =>
      setOutcome(result ? `${result.id}:${result.from.index}>${result.to.index}` : "cancel"),
    onMove: ({ from, to }: SortableMove) => setOrder((list) => move(list, from.index, to.index)),
  };
  const sortable = untrack(() => props.core)
    ? createCore({ ...options, messages: defaultMessages })
    : createSortable(options);
  return { outcome, sortable };
}

/*
 * One sortable list with its order printed as text (`data-order`), the last outcome (`data-outcome`: the move, or
 * "cancel") and a click counter for buttons inside items. Ported from the monorepo's dnd harness.
 */
export function HarnessList(props: HarnessListProps): JSX.Element {
  const [order, setOrder] = createSignal(untrack(() => props.entries));
  const [clicks, setClicks] = createSignal(0);
  const { outcome, sortable } = sortableOf(props, setOrder);
  /* Whole items count their own clicks: none may follow a drag. */
  const countClicks = (el: HTMLElement) =>
    el.addEventListener("click", (event) => {
      if (!props.handles && event.target === el) setClicks((count) => count + 1);
    });
  return (
    <section class="harness-section" data-list={props.id}>
      <ul
        ref={sortable.list({
          axis: props.axis,
          id: props.id,
          keyboard: props.keyboard,
          label: props.label ? () => props.label as string : undefined,
        })}
        class={props.class ?? "harness-list"}
        data-testid={`list-${props.id}`}
      >
        <For each={order()}>
          {(entry) => {
            const item = sortable.item({
              disabled: () => Boolean(entry.disabled),
              id: entry.id,
              label: () => `Item ${entry.id}`,
            });
            return (
              <li
                ref={[item.ref, countClicks]}
                class={props.itemClass ?? "harness-item"}
                data-id={entry.id}
                data-testid={`item-${props.id}-${entry.id}`}
                tabindex={props.handles || props.links ? undefined : 0}
                style={entry.tall ? { height: `${40 + entry.tall}px` } : undefined}
              >
                {props.handles ? (
                  <button
                    ref={item.handle}
                    type="button"
                    class="harness-handle"
                    aria-label={`Move ${entry.id}`}
                    data-testid={`handle-${props.id}-${entry.id}`}
                  >
                    {/* A child element, like an icon: a touch on it is captured by it first. */}
                    <span class="harness-glyph">⠿</span>
                  </button>
                ) : null}
                {props.links ? (
                  <a href={`#${entry.id}`} data-testid={`link-${props.id}-${entry.id}`}>
                    {entry.id}
                  </a>
                ) : (
                  <span>{entry.id}</span>
                )}
                <button
                  type="button"
                  class="harness-inner"
                  data-testid={`inner-${props.id}-${entry.id}`}
                  onClick={() => setClicks((count) => count + 1)}
                >
                  open
                </button>
              </li>
            );
          }}
        </For>
      </ul>
      <p>
        order:{" "}
        <output data-order={props.id}>
          {order()
            .map((entry) => entry.id)
            .join(",")}
        </output>{" "}
        outcome: <output data-outcome={props.id}>{outcome()}</output> clicks:{" "}
        <output data-clicks={props.id}>{clicks()}</output>
      </p>
    </section>
  );
}

/** `count` entries named a, b, c…, each with its `extra` options. */
export function letters(count: number, extra: Partial<Record<string, Partial<HarnessEntry>>> = {}): HarnessEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const id = String.fromCharCode(97 + i);
    return { id, ...extra[id] };
  });
}
