import { extname } from "node:path";

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

import { generate } from "./generate.ts";
import type { Pass } from "./generate.ts";
import { PACKAGE_NAME } from "./package-name.constants.ts";
import { serialized } from "./serialized.ts";

// The Vite plugin: lists in `ui.generated.css`, beside each CSS entry that imports Tailwind, exactly the classes of the
// exports the app and the packages it installs import from @workerstack/ui, so Tailwind builds those and no others.

const DEBOUNCE_MS = 50;
const SOURCE_EXTENSIONS: readonly string[] = [".cjs", ".cts", ".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx"];

/** Whether a change to `path` can change what the app imports. */
function isRelevant(pass: Pass, path: string): boolean {
  return !pass.generated.has(path) && (pass.watched.has(path) || SOURCE_EXTENSIONS.includes(extname(path)));
}

/** The dev server's change hook: reruns `refresh` shortly after a relevant file changes. */
function watcher(
  pass: () => Pass,
  refresh: () => Promise<string | undefined>,
  fail: (message: string) => void,
): (path: string) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (path) => {
    if (!isRelevant(pass(), path)) return;

    clearTimeout(timer);
    timer = setTimeout(() => {
      void refresh().then((failure) => {
        if (failure !== undefined) fail(failure);
      });
    }, DEBOUNCE_MS);
  };
}

/**
 * The plugin. List it after `tailwindcss()`; it writes `ui.generated.css` beside each CSS file that imports
 * "tailwindcss" before Tailwind reads it, and again when the app's imports change in dev.
 */
export function ui(): Plugin {
  let config: ResolvedConfig | undefined;
  let server: ViteDevServer | undefined;
  let pass: Pass = { generated: new Set(), watched: new Set() };

  const refresh = serialized(async () => {
    if (config === undefined) return;

    pass = await generate({ root: config.root, warn: (message) => config?.logger.warn(message) });
    server?.watcher.add([...pass.watched]);
  });

  return {
    async buildStart() {
      const failure = await refresh();

      if (failure !== undefined) this.error(failure);
    },
    configResolved(resolved) {
      config = resolved;
    },
    configureServer(devServer) {
      const onChange = watcher(
        () => pass,
        refresh,
        (message) => config?.logger.error(message),
      );

      server = devServer;
      devServer.watcher.on("change", onChange).on("add", onChange).on("unlink", onChange);
    },
    name: PACKAGE_NAME,
  };
}
