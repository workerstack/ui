import { cn, type ClassValue } from "cn";

import { isStateFunction } from "../internal/index.ts";

/**
 * `cn` from shadcn's `cn` package: joins class names (strings, arrays, `{ name: condition }`
 * objects) and lets later Tailwind classes win over earlier ones. It is a drop-in for
 * clsx + tailwind-merge, with the same output.
 */
export { cn };

export type { ClassValue };

/** A UI SDK part's `class`: class names, or a function of the part's state that returns them. */
export type StateClass<State> = ClassValue | ((state: State) => ClassValue);

function resolve<State>(value: StateClass<State> | undefined, state: State): ClassValue {
  return isStateFunction(value) ? value(state) : value;
}

/**
 * Merges a component's own classes with the consumer's `class`, either of which may be a function
 * of the part's state. Stays a plain string when neither is a function, so the server renders the
 * same class the client starts with.
 */
export function cnState<State>(
  base: StateClass<State>,
  user: StateClass<State> | undefined,
): string | ((state: State) => string) {
  if (!isStateFunction(base) && !isStateFunction(user)) return cn(base, user);

  return (state: State) => cn(resolve(base, state), resolve(user, state));
}
