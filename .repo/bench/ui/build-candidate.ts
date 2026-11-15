import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type * as ViteModule from "vite";
import type { BuildOptions, Plugin } from "vite";

import { DIRECTIVE_LOG, KIT_ID, PAGE_ID, SOLID, SOLID_ID, VIRTUAL_PREFIX } from "./bench.constants.ts";
import type { Candidate } from "./candidate.ts";
import { entries } from "./entries.ts";
import { benchDir, coreRequire, outDir } from "./paths.ts";

type Vite = typeof ViteModule;

/** The Solid plugin's options this bench sets. */
type SolidOptions = { solid?: { hydratable: boolean }; ssr?: boolean };

type SolidPlugin = (options?: SolidOptions) => Plugin;

/** One bundle: its entry, its file and how Solid compiles it. */
type Bundle = { entry: string; externalSolid?: boolean; file: string; hydratable?: boolean; ssr?: boolean };

/** The toolchain every candidate builds with, loaded once. */
type Tools = { solid: SolidPlugin; vite: Vite };

const BUNDLES: Bundle[] = [
  { entry: "virtual:bench-size", externalSolid: true, file: "size.js", hydratable: true },
  { entry: "virtual:bench-client", file: "hydrate.js", hydratable: true },
  { entry: "virtual:bench-client", file: "mount.js" },
  { entry: "virtual:bench-server", file: "server.mjs", ssr: true },
];

async function load<T>(id: string): Promise<T> {
  const loaded: unknown = await import(pathToFileURL(coreRequire().resolve(id)).href);

  return loaded /* the module's own export shape */ as T;
}

function isBare(id: string): boolean {
  return !id.startsWith(".") && !id.startsWith("\0") && !id.startsWith("virtual:") && !path.isAbsolute(id);
}

function fixedIds(candidate: Candidate): Map<string, string> {
  return new Map([
    [KIT_ID, path.join(benchDir(), `${candidate.name}-kit.tsx`)],
    [PAGE_ID, path.join(benchDir(), "check.ts")],
  ]);
}

/**
 * Serves the entries and resolves what the bench's own modules import from the candidate's folder,
 * so a candidate gets its own library and its own Solid. With `externalSolid` every Solid import
 * stays a bare external, the same specifier for every candidate.
 */
function benchPlugin(candidate: Candidate, bundle: Bundle): Plugin {
  const anchor = path.join(candidate.from, "package.json");
  const modules = entries({ app: path.join(benchDir(), "app.tsx"), name: candidate.kit });
  const fixed = fixedIds(candidate);

  return {
    enforce: "pre",
    load: (id) => modules.get(id.slice(1)) ?? null,
    name: "bench",
    resolveId(id, importer, options) {
      if (fixed.has(id)) return fixed.get(id);

      if (modules.has(id)) return `\0${id}`;

      if (bundle.externalSolid === true && SOLID_ID.test(id)) return { external: true, id };

      const ours = importer?.startsWith(benchDir()) === true || importer?.startsWith(`\0${VIRTUAL_PREFIX}`) === true;

      return ours && isBare(id) ? this.resolve(id, anchor, { ...options, skipSelf: true }) : null;
    },
  };
}

function buildOptions(candidate: Candidate, bundle: Bundle): BuildOptions {
  const isSsr = bundle.ssr === true;

  return {
    chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
    copyPublicDir: false,
    emptyOutDir: false,
    minify: !isSsr,
    modulePreload: false,
    outDir: outDir(candidate.name),
    reportCompressedSize: false,
    rolldownOptions: {
      input: bundle.entry,
      onLog(level, log, handler) {
        if (log.code !== DIRECTIVE_LOG) handler(level, log);
      },
      output: { codeSplitting: false, entryFileNames: bundle.file, format: "es" },
    },
    ssr: isSsr,
    target: isSsr ? "node22" : "es2023",
  };
}

async function buildBundle(candidate: Candidate, tools: Tools, bundle: Bundle): Promise<void> {
  const client: SolidOptions = { solid: { hydratable: bundle.hydratable === true } };
  const solidOptions: SolidOptions = bundle.ssr === true ? { ssr: true } : client;

  await tools.vite.build({
    build: buildOptions(candidate, bundle),
    cacheDir: path.join(outDir(candidate.name), ".vite"),
    configFile: false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    envDir: outDir(candidate.name),
    logLevel: "warn",
    mode: "production",
    plugins: [benchPlugin(candidate, bundle), tools.solid(solidOptions)],
    publicDir: false,
    resolve: { dedupe: SOLID },
    root: candidate.from,
    ssr: { noExternal: true, target: "node" },
  });
}

/** Builds the bundles one after another: each build replaces Vite's state. */
async function buildBundles(candidate: Candidate, tools: Tools, left: Bundle[]): Promise<void> {
  const bundle = left.at(0);

  if (bundle === undefined) return;

  await buildBundle(candidate, tools, bundle);
  await buildBundles(candidate, tools, left.slice(1));
}

/** Builds the size bundle (Solid external), the two page bundles and the server bundle, one after another. */
export async function buildCandidate(candidate: Candidate): Promise<void> {
  if (!existsSync(path.join(candidate.from, "package.json"))) throw new Error(`${candidate.from} has no package.json`);

  candidate.prepare?.();
  rmSync(outDir(candidate.name), { force: true, recursive: true });

  const plugin = await load<{ default: SolidPlugin }>("@solidjs/vite-plugin");
  const tools: Tools = { solid: plugin.default, vite: await load<Vite>("vite") };

  await buildBundles(candidate, tools, BUNDLES);
}
