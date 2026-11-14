import type { JSX } from "@solidjs/web";

/** Opening and closing motion shared by popups that open from an anchor (select, menu, popover). */
export const popupMotion: string[] = [
  "origin-(--transform-origin) transition-[opacity,scale] duration-150 data-starting-style:scale-95",
  "data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
  "motion-reduce:transition-none",
];

type Children<State> = JSX.Element | ((state: State) => JSX.Element);

/**
 * A part's children followed by something of ours (a chevron, a check). The consumer's children may
 * be a function of the part's state, so the result is one too. A function that takes no argument is
 * plain content, not a state function.
 */
export function withAfter<State>(children: Children<State>, after: JSX.Element): (state: State) => JSX.Element {
  return (state) => [resolve(children, state), after];
}

/** Like `withAfter`, with ours first (a checkbox item's check). */
export function withBefore<State>(before: JSX.Element, children: Children<State>): (state: State) => JSX.Element {
  return (state) => [before, resolve(children, state)];
}

/** Whether a UI SDK `class` or `children` prop is a function of the part's state, not a value. */
export function isStateFunction<Value, State>(
  value: Value | ((state: State) => Value),
): value is (state: State) => Value {
  return typeof value === "function";
}

function resolve<State>(children: Children<State>, state: State): JSX.Element {
  if (!isStateFunction(children)) return children;

  if (children.length > 0) return children(state);

  // A function that takes no argument is plain content Solid calls itself, not a state function.
  return children /* a zero-argument function is a valid JSX.Element */ as JSX.Element;
}
