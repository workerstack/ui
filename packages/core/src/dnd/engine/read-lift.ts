// The lift's read phase: everything is measured before anything is written.
import { modalOf } from "../announce/live-region.ts";
import { cssNumber } from "../internal/css.ts";
import { reducedMotion } from "../motion/flip.ts";
import { createLedger } from "../motion/ledger.ts";
import { createAutoScroll } from "../scroll/auto-scroll.ts";
import { scrollChain } from "../scroll/scroll-chain.ts";
import type { Drag, LiftBase, Press, Registry } from "./drag.types.ts";
import type { ListState, PlacedItem, PlacedList } from "./engine.types.ts";
import { measureList } from "./measure-list.ts";
import { childrenOf } from "./registry.ts";

const SIDES = ["top", "right", "bottom", "left"] as const;
const BORDER_PARTS = ["width", "style", "color"] as const;
const OTHER_COPIED = ["color", "background-color", "overflow-x", "overflow-y"] as const;

/** Inline values read before the lift and written inline, so the browser's popover styles change nothing. */
function copiedStyle(style: CSSStyleDeclaration): Record<string, string> {
  const props = [
    ...SIDES.flatMap((side) => [`padding-${side}`, ...BORDER_PARTS.map((part) => `border-${side}-${part}`)]),
    ...OTHER_COPIED,
  ];

  return Object.fromEntries(props.map((prop) => [prop, style.getPropertyValue(prop)]));
}

/** Whether a list takes part in this drag: home, or a connected, enabled list a plain list drag can enter. */
export function isLinked(drag: Drag, reg: PlacedList): boolean {
  if (reg === drag.home) return true;

  return !drag.inPlace && !drag.homeState.grid && reg.el.isConnected && reg.disabled?.() !== true;
}

/** Measures every expander again, keeping how long the pointer has rested on each. */
export function measureExpanders(drag: Drag): void {
  for (const exp of drag.registry.expanders) {
    if (exp.el?.isConnected !== true) continue;
    const since = drag.expanding.get(exp)?.since ?? 0;
    drag.expanding.set(exp, { chain: scrollChain(exp.el, drag.cache), rect: exp.el.getBoundingClientRect(), since });
  }
}

/** The facts of a drag fixed at lift. */
type Facts = Omit<Drag, keyof Motion | keyof LiftBase>;

/** The parts of a drag that change while it runs, at their starting values. */
type Motion = Pick<
  Drag,
  | "allowed"
  | "blocked"
  | "changed"
  | "expanding"
  | "frame"
  | "lastTime"
  | "offs"
  | "phase"
  | "pointer"
  | "primed"
  | "reported"
  | "scroll"
  | "scrollDirty"
  | "states"
  | "target"
  | "transitions"
  | "translate"
  | "watched"
>;

/** A drag's moving parts at lift. */
function motionAt(facts: Facts): Motion {
  const { home, from, point, homeState } = facts;

  return {
    allowed: new Map([[`${home.id} ${from}`, true]]),
    blocked: false,
    changed: false,
    expanding: new Map(),
    frame: 0,
    lastTime: performance.now(),
    offs: [],
    phase: "dragging",
    pointer: point,
    primed: false,
    reported: `${home.id} ${from} false`,
    scroll: createAutoScroll(),
    scrollDirty: false,
    states: [homeState],
    target: homeState,
    transitions: false,
    translate: { x: 0, y: 0 },
    watched: new Set(),
  };
}

/** What a drag reads about its item and press. */
type Start = { registry: Registry; base: LiftBase; press: Press; home: PlacedList };

/** A drag's fixed facts. */
function factsAt(start: Start, regs: PlacedItem[], homeState: ListState): Facts {
  const { registry, base, press, home } = start;
  const { activator } = press;

  return {
    activator,
    el: base.item.el,
    focused: activator.contains(document.activeElement),
    followers: home.followers === undefined ? [] : [...home.followers(base.item.id)],
    from: regs.indexOf(base.item),
    home,
    homeState,
    ledger: createLedger(),
    modal: modalOf(activator),
    options: registry.options,
    point: press.point,
    pointerId: press.pointerId,
    reduced: reducedMotion(),
    registry,
    regs,
    reset: copiedStyle(getComputedStyle(base.item.el)),
  };
}

/** What lifts: the item, the press that lifts it, and its home list. */
export type Lifting = { item: PlacedItem; press: Press; home: PlacedList };

/** Reads everything a drag of `item` needs, before the lift writes anything. */
export function readLift(registry: Registry, lifting: Lifting): Drag {
  const { item, press, home } = lifting;
  const style = getComputedStyle(item.el);
  const [top = 0, right = 0, bottom = 0, left = 0] = SIDES.map((side) => cssNumber(style, `margin-${side}`));

  const base: LiftBase = {
    cache: new Map(),
    inPlace: home.followers !== undefined || style.display.startsWith("table"),
    item,
    lift: item.el.getBoundingClientRect(),
    margin: { bottom, left, right, top },
  };

  const regs = childrenOf(registry, home);
  const homeState = measureList(base, { again: false, members: regs, reg: home });
  const facts = factsAt({ base, home, press, registry }, regs, homeState);
  homeState.index = facts.from;
  const drag: Drag = { ...base, ...facts, ...motionAt(facts) };

  const others = [...registry.lists.values()].filter((reg) => reg !== home && isLinked(drag, reg));

  for (const reg of others)
    drag.states.push(measureList(drag, { again: false, members: childrenOf(registry, reg), reg }));

  measureExpanders(drag);

  return drag;
}
