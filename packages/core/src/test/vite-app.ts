import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { stripVTControlCharacters } from "node:util";

import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { build, createLogger, createServer } from "vite";
import type { InlineConfig, Logger, Plugin, PluginOption, ViteDevServer } from "vite";

import { SRC } from "./bundle.ts";
import { SCOPE } from "./scope.constants.ts";

// Apps for the Vite plugin's tests: a fixture is copied into a temp folder outside the repo (so .gitignore files are
// honored and Vite watches it). Its node_modules links each workspace package, so `vite`, Tailwind and Solid resolve,
// and holds the built package as an install would.

/** Where the apps live, the built package they link, and the plugin under test. */
export type Env = { apps: string; built: string; ui: () => Plugin };

export const GENERATED = /* @__PURE__ */ join("src", "ui.generated.css");
export const MAIN = /* @__PURE__ */ join("src", "main.tsx");
export const STYLES = /* @__PURE__ */ join("src", "styles.css");
export const FIXTURES = /* @__PURE__ */ join(SRC, "vite", "__fixtures__");

const WORKSPACE_MODULES = /* @__PURE__ */ join(SRC, "..", "..", "..", "node_modules");

const POLL_MS = 100;
const POLL_TIMEOUT_MS = 20_000;
const SOURCE_INLINE = /@source inline\("([^"]*)"\)/u;

/** Copies a fixture to `<apps>/<name>`, links the workspace packages and the built package, and returns its folder. */
export function makeApp(env: Env, name: string, fixture: string): string {
  const app = join(env.apps, name);

  rmSync(app, { force: true, recursive: true });
  cpSync(join(FIXTURES, fixture), app, { recursive: true });
  const modules = join(app, "node_modules");

  mkdirSync(join(modules, SCOPE), { recursive: true });

  const linked = readdirSync(WORKSPACE_MODULES).filter((entry) => entry !== SCOPE && !entry.startsWith("."));

  for (const entry of linked) symlinkSync(join(WORKSPACE_MODULES, entry), join(modules, entry));

  symlinkSync(realpathSync(env.built), join(modules, SCOPE, "ui"));

  return app;
}

/** Writes `text` to `file` under `app`, making the folders it needs. */
export function write(app: string, file: string, text: string): void {
  const path = join(app, file);

  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, text);
}

/** The classes in the `@source inline("...")` of the app's generated file, sorted. */
export function generatedClasses(app: string): string[] {
  const text = readFileSync(join(app, GENERATED), "utf8");
  const list = SOURCE_INLINE.exec(text)?.[1] ?? "";

  return list
    .split(" ")
    .filter((name) => name !== "")
    .toSorted();
}

/** A logger that keeps what a plugin warns, without ANSI color, and prints nothing. */
function collectingLogger(warnings: string[]): Logger {
  return {
    ...createLogger("silent"),
    warn: (message) => {
      warnings.push(stripVTControlCharacters(message));
    },
  };
}

/** A consumer's config: Solid, Tailwind, and the plugin under test. */
function configOf(env: Env, app: string, warnings: string[]): InlineConfig {
  const plugins: PluginOption[] = [solid(), tailwindcss(), env.ui()];

  return { configFile: false, customLogger: collectingLogger(warnings), plugins, root: app };
}

/** The text of a built asset. */
function textOf(source: string | Uint8Array): string {
  return source instanceof Uint8Array ? new TextDecoder().decode(source) : source;
}

/** Builds the app, and returns the text of the CSS it emits. */
export async function buildCss(env: Env, app: string, warnings: string[] = []): Promise<string> {
  const result = await build({
    ...configOf(env, app, warnings),
    build: { rollupOptions: { input: join(app, MAIN) }, write: false },
    mode: "production",
  });

  const outputs = Array.isArray(result) ? result : [result];

  return outputs
    .flatMap((one) => ("output" in one ? one.output : []))
    .flatMap((item) => (item.type === "asset" && item.fileName.endsWith(".css") ? [textOf(item.source)] : []))
    .join("\n");
}

/** Starts a dev server without a port, in the app's folder; the caller closes it. */
export function serve(env: Env, app: string, warnings: string[] = []): Promise<ViteDevServer> {
  return createServer({ ...configOf(env, app, warnings), appType: "custom", server: { middlewareMode: true } });
}

/** Polls `read` until `done` holds for its value; returns the last value read, which the caller asserts on. */
export async function until<T>(read: () => T, done: (value: T) => boolean, deadline?: number): Promise<T> {
  const limit = deadline ?? Date.now() + POLL_TIMEOUT_MS;
  const value = read();

  if (done(value) || Date.now() >= limit) return value;

  await new Promise((resolve) => setTimeout(resolve, POLL_MS));

  return until(read, done, limit);
}
