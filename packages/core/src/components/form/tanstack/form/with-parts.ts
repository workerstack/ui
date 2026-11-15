/**
 * A field module with its parts added or replaced. A call rather than an object spread at the top
 * of a module, so a bundle that never reads the module drops it: mark each call `@__PURE__`.
 */
export function withParts<TModule extends object, TParts extends object>(
  module: TModule,
  parts: TParts,
): Omit<TModule, keyof TParts> & TParts {
  return { ...module, ...parts };
}
