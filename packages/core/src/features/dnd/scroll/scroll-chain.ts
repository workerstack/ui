import { RTL } from "../internal/dnd.constants.ts";
import type { Scroller } from "./scroll.types.ts";

const SCROLLS = /(auto|scroll|hidden|clip)/;
const AUTO = /(auto|scroll)/;

/** Reads a scroller's offsets now. */
function readOffsets(scroller: Scroller): void {
  scroller.x = scroller.doc ? scrollX : scroller.el.scrollLeft;
  scroller.y = scroller.doc ? scrollY : scroller.el.scrollTop;
}

/** Reads the scroll offsets of every scroller again (after a scroll event). */
export function refreshOffsets(scrollers: Iterable<Scroller>): void {
  for (const scroller of scrollers) readOffsets(scroller);
}

/** Measures a scroller's box, extents and offsets, and takes the offsets as the lift's. */
function measureScroller(scroller: Scroller): void {
  const { el, doc } = scroller;
  // The document's box is the viewport; an element's is its padding box.
  const target = doc ? document.documentElement : el;
  const box = doc ? { x: 0, y: 0 } : el.getBoundingClientRect();
  scroller.rect = {
    height: target.clientHeight,
    width: target.clientWidth,
    x: box.x + target.clientLeft,
    y: box.y + target.clientTop,
  };
  scroller.maxX = target.scrollWidth - target.clientWidth;
  scroller.maxY = target.scrollHeight - target.clientHeight;
  readOffsets(scroller);
  scroller.x0 = scroller.x;
  scroller.y0 = scroller.y;
}

/** The elements that scroll or clip from `el` up, innermost first, ending with the document's scroller. */
function scrollingNodes(el: Element, root: Element): Element[] {
  const nodes: Element[] = [];

  for (let node: Element | null = el; node !== null && node !== document.body; node = node.parentElement) {
    if (node === document.documentElement) break;
    const style = getComputedStyle(node);

    if (SCROLLS.test(style.overflowX + style.overflowY)) nodes.push(node);
  }

  nodes.push(root);

  return nodes;
}

/** A new scroller for `node`, measured, inside the scrollers of `outer` (outermost first). */
function newScroller(node: Element, root: Element, outer: readonly Scroller[]): Scroller {
  const style = getComputedStyle(node);

  const scroller: Scroller = {
    auto: node === root || AUTO.test(style.overflowX + style.overflowY),
    doc: node === root,
    el: node,
    maxX: 0,
    maxY: 0,
    outer: outer.toReversed(),
    rect: { height: 0, width: 0, x: 0, y: 0 },
    rtl: style.direction === RTL,
    x: 0,
    x0: 0,
    y: 0,
    y0: 0,
  };

  measureScroller(scroller);

  return scroller;
}

/**
 * The scroll chain around `el` (including `el` when it scrolls itself), innermost first and ending with the
 * document. Scrollers are shared through `cache`, so lists in one drag see the same ones.
 */
export function scrollChain(el: Element, cache: Map<Element, Scroller>): Scroller[] {
  const root = document.scrollingElement ?? document.documentElement;
  const chain: Scroller[] = [];

  for (const node of scrollingNodes(el, root).toReversed()) {
    const scroller = cache.get(node) ?? newScroller(node, root, chain);
    cache.set(node, scroller);
    chain.push(scroller);
  }

  return chain.toReversed();
}

/** Re-measures scrollers after a layout change (their extents can change). */
export function remeasureScrollers(scrollers: Iterable<Scroller>): void {
  for (const scroller of scrollers) measureScroller(scroller);
}
