import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import solid from "@solidjs/vite-plugin";
import { build } from "vite";
import type { Plugin } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { exportMap, publicFolders } from "../scripts/export-map.ts";
import { reach, SRC } from "./test/bundle.ts";

// How an app consumes the package: the build is laid out as a package, linked into an app's node_modules, and bundled
// by Vite with the Solid plugin, importing through the export keys. Every other bare import stays external, so what
// is left is our code. Sizes are what Rollup rendered per module, after minifying.

const ROOT = join(SRC, "..");
const PACKAGE_NAME = "@workerstack/ui";
const FORM = "components/form/";
const VIRTUAL = "\0consumer";
const TANSTACK = /@tanstack\//u;

const TMP = mkdtempSync(join(tmpdir(), "workerstack-consumer-"));
const PACKAGE = join(TMP, "package");
const APP = join(TMP, "app");

/** The modules of ours in a bundle, as paths under src/, with the bytes each put in it, and the bundle's code. */
type Consumed = { code: string; kept: Map<string, number> };

/** The src/ file a built module comes from: the built `.js` or `.jsx` is a `.ts` or `.tsx` there. */
function sourceOf(built: string): string {
  const stem = relative(join(PACKAGE, "dist"), built).replace(/\.jsx?$/u, "");

  return [".ts", ".tsx"].map((ext) => stem + ext).find((path) => existsSync(join(SRC, path))) ?? stem;
}

/** Rollup's `external`: every bare import stays out of the bundle, except the package under test. */
function isExternal(id: string): boolean {
  const ours = id.startsWith("\0") || id.startsWith(".") || id.startsWith("/") || id.startsWith(PACKAGE_NAME);

  return !ours;
}

/** True for a module of the package that put code in the bundle. */
function isOwn([id, module]: [string, { renderedLength: number }]): boolean {
  return id.startsWith(PACKAGE) && module.renderedLength > 0;
}

/** Bundles `source` the way an app does, importing through the package's export keys. */
async function consume(source: string): Promise<Consumed> {
  const entry: Plugin = {
    load: (id) => (id === VIRTUAL ? source : null),
    name: "consumer-entry",
    resolveId: (id) => (id === VIRTUAL ? VIRTUAL : null),
  };

  const result = await build({
    build: { minify: true, rollupOptions: { external: isExternal, input: VIRTUAL, treeshake: true }, write: false },
    configFile: false,
    logLevel: "silent",
    plugins: [solid(), entry],
    root: APP,
  });

  const outputs = Array.isArray(result) ? result : [result];
  const chunk = outputs.flatMap((each) => ("output" in each ? each.output : [])).find((each) => each.type === "chunk");

  if (chunk === undefined) throw new Error("the bundle has no chunk");

  const own = Object.entries(chunk.modules).filter(isOwn);

  return { code: chunk.code, kept: new Map(own.map(([id, module]) => [sourceOf(id), module.renderedLength])) };
}

beforeAll(() => {
  mkdirSync(PACKAGE, { recursive: true });

  const dist = join(PACKAGE, "dist");
  const flags = ["--outDir", dist, "--declaration", "false", "--declarationMap", "false", "--sourceMap", "false"];

  execFileSync("bunx", ["tsc", "-p", "tsconfig.build.json", ...flags], { cwd: ROOT, stdio: "pipe" });
  copyFileSync(join(SRC, "theme.css"), join(dist, "theme.css"));
  copyFileSync(join(ROOT, "package.json"), join(PACKAGE, "package.json"));

  mkdirSync(join(APP, "node_modules", "@workerstack"), { recursive: true });
  symlinkSync(realpathSync(PACKAGE), join(APP, "node_modules", PACKAGE_NAME));
}, 120_000);

afterAll(() => rmSync(TMP, { force: true, recursive: true }));

/** The export keys of folders, as import specifiers. */
const FILES = new Set(["./package.json", "./theme.css"]);
const KEYS = [...exportMap(SRC).keys()].filter((key) => !FILES.has(key));

function specifier(key: string): string {
  return `${PACKAGE_NAME}/${key.slice(2)}`;
}

/** A name imported from an entry, and the module that defines it. */
type NamedCase = [entry: string, name: string, defining: string];

const NAMED: NamedCase[] = [
  ["components/button", "Button", "components/button/button.tsx"],
  ["components/checkbox", "Checkbox", "components/checkbox/checkbox.tsx"],
  ["components/field", "FieldLabel", "components/field/field-label.tsx"],
  ["components/form/tanstack/form", "SubmitButton", "components/form/tanstack/form/form-parts.tsx"],
  ["features/dnd/sortable", "createSortable", "features/dnd/sortable/create-sortable.ts"],
  ["utils/cn", "cnState", "utils/cn/cn.ts"],
];

const PLAIN = publicFolders(SRC).filter((folder) => !folder.startsWith(FORM));

describe("an app's build through the export keys", () => {
  it("lists a key for every public folder", () => {
    expect(KEYS).toStrictEqual(publicFolders(SRC).map((folder) => `./${folder}`));
  });

  it.each(KEYS)("%s imported for nothing keeps no code", async (key) => {
    const { kept } = await consume(`import ${JSON.stringify(specifier(key))};\n`);

    expect([...kept]).toStrictEqual([]);
  });

  it.each(NAMED)("%s keeps only %s and what %s imports", async (entry, name, defining) => {
    const { kept } = await consume(
      `import { ${name} } from ${JSON.stringify(specifier(`./${entry}`))};\nconsole.info(${name});\n`,
    );

    const related = reach(defining);

    expect({
      defining: kept.has(defining),
      unrelated: [...kept.keys()].filter((module) => !related.has(module)),
    }).toStrictEqual({ defining: true, unrelated: [] });
  });

  it.each(PLAIN)("%s, bundled whole, holds no @tanstack import", async (folder) => {
    const { code } = await consume(`export * from ${JSON.stringify(specifier(`./${folder}`))};\n`);

    expect(TANSTACK.test(code)).toBe(false);
  });
});
