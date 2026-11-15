import { createComponent, hydrate, type JSX } from "@solidjs/web";
import { flush } from "solid-js";
import { onTestFinished, vi } from "vitest";
import { commands } from "vitest/browser";

import type { ServerRendered } from "../../vitest.hydration.commands.ts";

const HYDRATION_MESSAGE = /hydrat/i;

/** A fixture hydrated over its server HTML, and what the two renders disagreed on. */
export type Hydrated = {
  container: HTMLElement;
  server: ServerRendered;
  /** Hydration problems the client runtime reported: key misses, unclaimed nodes, DOM it had to create. */
  warnings: string[];
  /** Elements from the server HTML that hydration threw away instead of claiming. */
  replaced: Element[];
  /** Elements hydration added that the server didn't render. */
  added: Element[];
  dispose: () => void;
};

/** The hydrated root, once `hydrate` has returned its disposer. */
type HydratedRoot = { dispose?: () => void };

/** Collects the elements added under `container` until the returned function is called. */
function watchAdded(container: HTMLElement): () => Element[] {
  const added: Element[] = [];

  function take(records: MutationRecord[]): void {
    for (const record of records) for (const node of record.addedNodes) if (node instanceof Element) added.push(node);
  }

  const observer = new MutationObserver(take);
  observer.observe(container, { childList: true, subtree: true });

  return () => {
    take(observer.takeRecords());
    observer.disconnect();

    return added.filter((el) => el.isConnected);
  };
}

/** Runs `run` and returns the hydration warnings it logged; other console output passes through. */
function hydrationWarnings(run: () => void): string[] {
  const warn = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");

  try {
    run();

    // Read before the restore: vitest's mockRestore clears the calls.
    return [...warn.mock.calls, ...error.mock.calls]
      .map((args) => args.map(String).join(" "))
      .filter((message) => HYDRATION_MESSAGE.test(message));
  } finally {
    warn.mockRestore();
    error.mockRestore();
  }
}

/**
 * Renders `name` from the fixture module on the server (in Node), puts the HTML in the page and
 * hydrates it with `code`, the same fixture compiled for the client. `fixture` is the module's URL:
 * `new URL("./button.hydration.fixture.tsx", import.meta.url)`.
 */
async function serverThenHydrate(fixture: URL, name: string, code: () => JSX.Element): Promise<Hydrated> {
  const server = await commands.serverRender(fixture.pathname, name);
  const container = document.createElement("div");
  container.innerHTML = server.html;
  document.body.append(container);
  const before = [...container.querySelectorAll("*")];
  const added = watchAdded(container);
  Object.assign(window, { _$HY: { completed: new WeakSet(), done: false, events: [], fe() {}, r: {} } });
  const root: HydratedRoot = {};

  const warnings = hydrationWarnings(() => {
    root.dispose = hydrate(code, container);
    flush();
  });

  function dispose(): void {
    root.dispose?.();
    container.remove();
  }

  return {
    added: added(),
    container,
    dispose,
    replaced: before.filter((el) => !el.isConnected),
    server,
    warnings,
  };
}

/**
 * A `hydrate(name)` for one fixture module: server-renders and hydrates the named fixture, and
 * disposes it when the test finishes.
 */
export function hydrator<Name extends string>(
  fixture: URL,
  fixtures: Record<Name, () => JSX.Element>,
): (name: Name) => Promise<Hydrated> {
  return async (name) => {
    const hydrated = await serverThenHydrate(fixture, name, () => createComponent(fixtures[name], {}));
    onTestFinished(hydrated.dispose);

    return hydrated;
  };
}

/** A kind of disagreement between the server's render and hydration. */
export type MismatchKind = "added" | "replaced" | "serverWarnings" | "warnings";

const EVERY_KIND: MismatchKind[] = ["serverWarnings", "warnings", "replaced", "added"];

/** A readable element for a failure message: `button[data-slot=button]`. */
function label(el: Element): string {
  const slot = el.getAttribute("data-slot");

  return `${el.tagName.toLowerCase()}${slot === null ? "" : `[data-slot=${slot}]`}`;
}

/** Each kind of disagreement that happened, with what it hit. */
export type Mismatch = Partial<Record<MismatchKind, string[]>>;

/**
 * The disagreements of the given kinds that happened, readable in a failure message. A clean
 * hydration is `{}`.
 */
export function mismatch(hydrated: Hydrated, kinds: MismatchKind[] = EVERY_KIND): Mismatch {
  const found: Record<MismatchKind, string[]> = {
    added: hydrated.added.map(label),
    replaced: hydrated.replaced.map(label),
    serverWarnings: hydrated.server.warnings,
    warnings: hydrated.warnings,
  };

  return Object.fromEntries(kinds.filter((kind) => found[kind].length > 0).map((kind) => [kind, found[kind]]));
}
