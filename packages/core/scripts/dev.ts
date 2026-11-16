// Rebuilds dist/ as sources change, for consumers in the workspace (the playground) that import
// the package the way an app does: through its exports, from dist. tsc watches the TypeScript;
// theme.css is copied on change, as `build` copies it, and after every compile dist/classes.json is written, one run
// at a time: a compile that lands mid-run queues one more run, and repeats collapse into it.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, watch, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildClasses } from "./build-classes.ts";
import { THEME } from "./theme.constants.ts";

const SIGNALS = ["SIGINT", "SIGTERM"] as const;

/** tsc's line once a compile is in dist/. */
const COMPILED = "Watching for file changes";

/** How long to wait before reading the theme again when an editor's save caught it empty. */
const RETRY_MS = 50;
const RETRIES = 10;

/** The theme's source, or "" while an editor that saves by replacing the file has it missing. */
function readTheme(root: string): string {
  try {
    return readFileSync(join(root, "src", THEME), "utf8");
  } catch {
    return "";
  }
}

/** Copies the theme into dist/, as `build` does. An empty read is an editor mid-save: try again shortly. */
function copyTheme(root: string, retries = RETRIES): void {
  const css = readTheme(root);

  if (css.length === 0) {
    if (retries > 0) setTimeout(() => copyTheme(root, retries - 1), RETRY_MS);

    return;
  }

  mkdirSync(join(root, "dist"), { recursive: true });
  writeFileSync(join(root, "dist", THEME), css);
}

/** Copies the theme whenever it changes. Watches src/, not the file: an editor that saves by
    replacing the file would leave a watch on the old one firing no more. */
function watchTheme(root: string): void {
  watch(join(root, "src"), (_event, file) => {
    if (file === THEME) copyTheme(root);
  });
}

/** Writes the class manifest. A failure is reported, not thrown. */
async function writeClasses(root: string): Promise<void> {
  try {
    await buildClasses(join(root, "dist"), join(root, "src"));
  } catch (error) {
    process.stderr.write(`${String(error)}\n`);
  }
}

/** Makes `task` run one at a time. A request while one runs queues one more run, and further requests share it. */
function serialize(task: () => Promise<void>): () => Promise<void> {
  let running: Promise<void> | undefined;
  let queued: Promise<void> | undefined;

  function start(): Promise<void> {
    const current = task().finally(() => {
      running = undefined;
    });

    running = current;

    return current;
  }

  return () => {
    if (running === undefined) return start();

    queued ??= running.then(() => {
      queued = undefined;

      return start();
    });

    return queued;
  };
}

/** Passes tsc's output on. After a compile the outputs come first, so whoever waits for the line finds them there. */
async function pass(rebuild: () => Promise<void>, chunk: Buffer): Promise<void> {
  try {
    if (chunk.toString().includes(COMPILED)) await rebuild();
  } finally {
    process.stdout.write(chunk);
  }
}

/** Starts from an empty dist/, then keeps it current until a signal stops tsc. */
function run(): void {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  rmSync(join(root, "dist"), { force: true, recursive: true });
  copyTheme(root);
  watchTheme(root);

  const tsc = spawn("bunx", ["tsc", "-p", "tsconfig.build.json", "--watch", "--preserveWatchOutput"], {
    cwd: root,
    stdio: ["ignore", "pipe", "inherit"],
  });

  const rebuild = serialize(() => writeClasses(root));

  tsc.stdout.on("data", (chunk: Buffer) => void pass(rebuild, chunk));

  for (const signal of SIGNALS) process.on(signal, () => tsc.kill(signal));
  tsc.on("exit", (code) => process.exit(code ?? 0));
}

if (import.meta.main) run();
