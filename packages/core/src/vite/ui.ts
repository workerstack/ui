import { extname } from "node:path";

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

import { generate } from "./generate.ts";
import type { Pass, Report } from "./generate.ts";
import { PACKAGE_NAME } from "./package-name.constants.ts";
import { serialized } from "./serialized.ts";

// The Vite plugin: writes `ui.generated.css` beside each CSS entry that imports Tailwind: UI SDK's base.css, the theme
// of `ui.config.ts`, and exactly the classes of the exports the app and the packages it installs import from
// @workerstack/ui, so Tailwind builds those and no others. It adds the import of that file to the entry when missing.

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

/** Where a pass reports: the app's root and the Vite logger. */
function reportOf({ logger, root }: ResolvedConfig): Report {
  return { info: (message) => logger.info(message), root, warn: (message) => logger.warn(message) };
}

/**
 * The plugin. List it after `tailwindcss()`; it writes `ui.generated.css` beside each CSS file that imports
 * "tailwindcss" before Tailwind reads it, and again when the app's imports or `ui.config.ts` change in dev.
 */
export function ui(): Plugin {
  let config: ResolvedConfig | undefined;
  let server: ViteDevServer | undefined;
  let pass: Pass = { generated: new Set(), watched: new Set() };

  const refresh = serialized(async () => {
    if (config === undefined) return;

    pass = await generate(reportOf(config));
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
