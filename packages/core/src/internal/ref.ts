import { untrack } from "solid-js";

import { isStateFunction } from "./internal.ts";

/** A JSX `ref` prop: a function, an element holder, or a list of them. */
export type RefLike<T> = T | ((element: T) => void) | undefined | RefLike<T>[];

function handRef<T>(ref: RefLike<T>, element: T): void {
  if (Array.isArray(ref)) for (const each of ref) handRef(each, element);
  else if (isStateFunction<RefLike<T>, T>(ref)) ref(element);
}

/**
 * Hands `element` to a JSX `ref` prop the way Solid does: functions are called, lists are walked.
 * The prop is read untracked, as Solid reads a ref once: a merged prop is reactive, and a ref
 * callback can run inside an effect.
 */
export function callRef<T>(ref: () => RefLike<T>, element: T): void {
  handRef(untrack(ref), element);
}
