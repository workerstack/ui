/** A promise and the function that settles it, for an onClick that stays pending until told. */
export type Deferred = { promise: Promise<void>; resolve: () => void };

/** A promise that stays pending until `resolve` runs. */
export function deferred(): Deferred {
  const settle: Deferred = { promise: Promise.resolve(), resolve() {} };

  settle.promise = new Promise<void>((resolve) => {
    settle.resolve = resolve;
  });

  return settle;
}
