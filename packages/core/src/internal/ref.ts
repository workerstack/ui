import { isStateFunction } from "./internal.ts";

/** A JSX `ref` prop: a function, an element holder, or a list of them. */
export type RefLike<T> = T | ((element: T) => void) | undefined | RefLike<T>[];

/** Hands `element` to a JSX `ref` prop the way Solid does: functions are called, lists are walked. */
export function callRef<T>(ref: RefLike<T>, element: T): void {
  if (Array.isArray(ref)) for (const each of ref) callRef(each, element);
  else if (isStateFunction<RefLike<T>, T>(ref)) ref(element);
}
