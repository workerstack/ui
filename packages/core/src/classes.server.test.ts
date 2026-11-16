import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { publicFolders } from "../scripts/export-map.ts";
import { buildPackage } from "./test/build-package.ts";
import { SRC } from "./test/bundle.ts";
import { consume, specifier } from "./test/consume.ts";

// What an app's Tailwind reads per export. dist/classes.json lists, for each public folder, the classes each export
// reaches. The test holds it to the folders' real exports, and to the CSS an app gets when it imports that export.

const ROOT = join(SRC, "..");
const TMP = mkdtempSync(join(tmpdir(), "workerstack-classes-"));
const FOLDERS = publicFolders(SRC);
const APP = join(TMP, "app");
const PACKAGE = join(TMP, "package");
const PACKAGE_NAME = "@workerstack/ui";
const MANIFEST = "classes.json";

/** A class Button's own file sets (its base styles). */
const BUTTON_CLASS = "cursor-pointer";

/** A class only Dialog's footer sets, in no module Button reaches. */
const DIALOG_ONLY_CLASS = "flex-col-reverse";

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
  const css = `@import "tailwindcss";\n@import "${join(SRC, "theme.css")}";`;
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

  it("holds the Dialog-only class for DialogFooter", () => {
    expect(manifest["components/dialog"]?.["DialogFooter"]).toContain(DIALOG_ONLY_CLASS);
  });
});

describe("an export's classes", () => {
  it.each(PAIRS)(
    "%s %s makes the CSS of the export's bundle",
    async (folder, name) => {
      const { code } = await consume(
        `export { ${name} } from ${JSON.stringify(specifier(`./${folder}`))};\n`,
        APP,
        realpathSync(PACKAGE),
      );

      const scanned = new Scanner({}).scanFiles([{ content: code, extension: "js" }]);

      expect(await cssOf(manifest[folder]?.[name] ?? [])).toBe(await cssOf(scanned));
    },
    60_000,
  );
});
