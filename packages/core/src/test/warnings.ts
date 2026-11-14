import { vi } from "vitest";

/** What `run` returned, and what it wrote to `console.warn` / `console.error` (silenced meanwhile). */
export type Warned<T> = { result: T; warnings: string[] };

/** Runs `run` with console warnings and errors collected instead of printed, as server renders do. */
export function collectWarnings<T>(run: () => T): Warned<T> {
  const warnings: string[] = [];

  function collect(...args: unknown[]): void {
    warnings.push(args.map(String).join(" "));
  }

  const warn = vi.spyOn(console, "warn").mockImplementation(collect);
  const error = vi.spyOn(console, "error").mockImplementation(collect);

  try {
    return { result: run(), warnings };
  } finally {
    warn.mockRestore();
    error.mockRestore();
  }
}
