import { vi } from "vitest";

/** What `run` returned, and what it wrote to `console.warn` / `console.error` (silenced meanwhile). */
export type Warned<T> = { result: T; warnings: string[] };

/** Starts collecting console warnings and errors into `warnings`; returns how to stop. */
function spyWarnings(warnings: string[]): () => void {
  function collect(...args: unknown[]): void {
    warnings.push(args.map(String).join(" "));
  }

  const warn = vi.spyOn(console, "warn").mockImplementation(collect);
  const error = vi.spyOn(console, "error").mockImplementation(collect);

  return () => {
    warn.mockRestore();
    error.mockRestore();
  };
}

/** Runs `run` with console warnings and errors collected instead of printed, as server renders do. */
export function collectWarnings<T>(run: () => T): Warned<T> {
  const warnings: string[] = [];
  const stop = spyWarnings(warnings);

  try {
    return { result: run(), warnings };
  } finally {
    stop();
  }
}

/** Like `collectWarnings`, for a `run` that waits: collects until its promise settles. */
export async function collectWarningsAsync<T>(run: () => Promise<T>): Promise<Warned<T>> {
  const warnings: string[] = [];
  const stop = spyWarnings(warnings);

  try {
    return { result: await run(), warnings };
  } finally {
    stop();
  }
}
