import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { uiFolders } from "../scripts/export-map.ts";
import { buildPackage } from "./test/build-package.ts";
import { SRC } from "./test/bundle.ts";
import { consume, specifier } from "./test/consume.ts";

// What an app's Tailwind reads per export. dist/classes.json lists, for each public folder, the classes each export
// reaches. The test holds it to the folders' real exports, and to the CSS an app gets when it imports that export.

const ROOT = join(SRC, "..");
const TMP = mkdtempSync(join(tmpdir(), "workerstack-classes-"));
const FOLDERS = uiFolders(SRC);
const APP = join(TMP, "app");
const PACKAGE = join(TMP, "package");
const PACKAGE_NAME = "@workerstack/ui";
const MANIFEST = "classes.json";

/** A class Button's own file sets (its base styles). */
const BUTTON_CLASS = "cursor-pointer";

/** A class only Dialog's footer sets, in no module Button reaches. */
const DIALOG_ONLY_CLASS = "flex-col-reverse";

/** A class Radio sets in a static `class="..."`, which Solid compiles to an attribute Tailwind's scanner skips. */
const RADIO_CLASS = "peer-data-disabled:opacity-50";

/** The key Vitest's module runner adds to every module it imports; it is no export. */
const MODULE_URL = "$$moduleUrl";

/** The classes of each export of each folder: folder, then export name. */
type Manifest = Record<string, Record<string, string[]>>;

/** The names a folder's index.ts exports, sorted. */
async function namesOf(folder: string): Promise<string[]> {
  const module = (await import(join(SRC, folder, "index.ts"))) /* a module namespace is an object */ as object;

  return Object.keys(module)
    .filter((name) => name !== MODULE_URL)
    .toSorted();
}

/** Every folder with each name it exports, for `it.each`. */
const GROUPS = await Promise.all(
  FOLDERS.map(async (folder) => {
    const names = await namesOf(folder);

    return names.map((name) => [folder, name] as const);
  }),
);

const PAIRS = GROUPS.flat();

let manifest: Manifest = {};

/** Tailwind reports the files a stylesheet depends on; the test has no watcher to tell. */
function noop(): void {}

beforeAll(async () => {
  const dist = await buildPackage(PACKAGE);

  mkdirSync(join(APP, "node_modules", "@workerstack"), { recursive: true });
  symlinkSync(realpathSync(PACKAGE), join(APP, "node_modules", PACKAGE_NAME));
  manifest = JSON.parse(readFileSync(join(dist, MANIFEST), "utf8")) /* the build wrote this shape */ as Manifest;
}, 300_000);

afterAll(() => rmSync(TMP, { force: true, recursive: true }));

/** The CSS Tailwind makes of `candidates`, from a fresh compile: a compiler keeps the candidates of earlier builds. */
async function cssOf(candidates: string[]): Promise<string> {
  const css = `@import "tailwindcss";\n@import "${join(SRC, "base.css")}";`;
  const compiler = await compile(css, { base: ROOT, onDependency: noop });

  return compiler.build(candidates);
}

describe("dist/classes.json", () => {
  it("has a folder for each public folder", () => {
    expect(Object.keys(manifest).toSorted()).toStrictEqual(FOLDERS);
  });

  it.each(FOLDERS)("%s has an entry for each name its index.ts exports", async (folder) => {
    expect(Object.keys(manifest[folder] ?? {}).toSorted()).toStrictEqual(await namesOf(folder));
  });

  it("holds a Button class for Button, and no class only Dialog's footer sets", () => {
    const classes = manifest["components/button"]?.["Button"] ?? [];

    expect({
      button: classes.includes(BUTTON_CLASS),
      dialog: classes.includes(DIALOG_ONLY_CLASS),
    }).toStrictEqual({
      button: true,
      dialog: false,
    });
  });

  it("holds a static class attribute's class for Radio", () => {
    expect(manifest["components/radio-group"]?.["Radio"]).toContain(RADIO_CLASS);
  });

  it("holds the Dialog-only class for DialogFooter", () => {
    expect(manifest["components/dialog"]?.["DialogFooter"]).toContain(DIALOG_ONLY_CLASS);
  });
});

/** The lines of a stylesheet, trimmed and without blanks. */
function linesOf(css: string): string[] {
  return css
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/** Bundles the export the way an app does, in the app folder that links the built package. */
function consumeExport(folder: string, name: string): ReturnType<typeof consume> {
  return consume(`export { ${name} } from ${JSON.stringify(specifier(`./${folder}`))};\n`, APP, realpathSync(PACKAGE));
}

/** The candidates Tailwind finds in the source text of the dist modules a bundle keeps, read by file extension. */
function foundInModules(modules: Map<string, number>): Set<string> {
  const files = [...modules.keys()].map((file) => ({
    content: readFileSync(file, "utf8"),
    extension: extname(file).slice(1),
  }));

  return new Set(new Scanner({}).scanFiles(files));
}

describe("an export's classes", () => {
  // The bundle is minified, so its scan also finds code that reads like a class (`gap-1` in `r.gap-1`). Only candidates
  // the modules' own text holds count as lost.
  it.each(PAIRS)(
    "%s %s makes at least the CSS of the export's consumer bundle",
    async (folder, name) => {
      const { code, modules } = await consumeExport(folder, name);
      const found = foundInModules(modules);
      const candidates = new Scanner({}).scanFiles([{ content: code, extension: "js" }]);
      const scanned = candidates.filter((one) => found.has(one));
      const made = new Set(linesOf(await cssOf(manifest[folder]?.[name] ?? [])));
      const lost = linesOf(await cssOf(scanned)).filter((line) => !line.startsWith("@layer") && !made.has(line));

      expect(lost).toStrictEqual([]);
    },
    60_000,
  );

  it.each(PAIRS)(
    "%s %s holds no class outside the modules its bundle keeps",
    async (folder, name) => {
      const { modules } = await consumeExport(folder, name);
      const found = foundInModules(modules);

      expect((manifest[folder]?.[name] ?? []).filter((candidate) => !found.has(candidate))).toStrictEqual([]);
    },
    60_000,
  );
});
