/** Adds a window listener, by default in the capture phase; returns its removal. */
export function listen<K extends keyof WindowEventMap>(
  type: K,
  fn: (event: WindowEventMap[K]) => void,
  options: AddEventListenerOptions = { capture: true },
): () => void {
  addEventListener(type, fn, options);

  return () => removeEventListener(type, fn, options);
}
