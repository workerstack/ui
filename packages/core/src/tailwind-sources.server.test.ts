import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { publicFolders } from "../scripts/export-map.ts";
import { STYLES } from "../scripts/theme.constants.ts";
import { buildPackage } from "./test/build-package.ts";
import { SRC } from "./test/bundle.ts";
import { consume, specifier } from "./test/consume.ts";

// What an app's Tailwind reads. Each entry's styles.css names the built files the entry reaches, and nothing else, so
// the classes in the app's CSS are those of the entries it imports. The test reads them the way Tailwind does: the
// `@source` lines compiled, then the files its scanner opens.

const ROOT = join(SRC, "..");
const TMP = mkdtempSync(join(tmpdir(), "workerstack-sources-"));
const FOLDERS = publicFolders(SRC);

/** A class Button's own file sets (its base styles), so any CSS of a Button entry holds it. */
const BUTTON_CLASS = ".cursor-pointer";

/** A class only Dialog's footer sets (`flex-col-reverse`), in no module Button reaches. */
const DIALOG_ONLY_CLASS = ".flex-col-reverse";

const APP = join(TMP, "app");
const PACKAGE_NAME = "@workerstack/ui";

/** Modules of the package a Button-only app never runs, though barrels (an index.ts re-exporting them) name them. */
const NOT_IN_BUTTON = [
  "internal/modal.js",
  "internal/option-items.js",
  "utils/text-hygiene/text-hygiene.js",
  "components/provider/ui-messages.js",
  "internal/validity.messages.js",
  "components/combobox/combobox-create.messages.js",
];

let dist = "";

/** Tailwind reports the files a stylesheet depends on; the test has no watcher to tell. */
function noop(): void {}

beforeAll(async () => {
  dist = await buildPackage(join(TMP, "package"));

  mkdirSync(join(APP, "node_modules", "@workerstack"), { recursive: true });
  symlinkSync(realpathSync(join(TMP, "package")), join(APP, "node_modules", PACKAGE_NAME));
}, 120_000);

afterAll(() => rmSync(TMP, { force: true, recursive: true }));

/** Compiles an app stylesheet: Tailwind, the theme, then each entry's styles.css. */
function compileApp(entries: string[]): ReturnType<typeof compile> {
  const imports = entries.map((entry) => `@import "${join(dist, entry, STYLES)}";`);
  const css = [`@import "tailwindcss";`, `@import "${join(SRC, "theme.css")}";`, ...imports].join("\n");

  return compile(css, { base: ROOT, onDependency: noop });
}

/** The CSS an app that imports only `entries` gets. */
async function cssOf(entries: string[]): Promise<string> {
  const compiler = await compileApp(entries);
  const candidates = new Scanner({ sources: compiler.sources }).scan();

  return compiler.build(candidates);
}

/** The sources an entry's styles.css names, as paths under dist/. */
async function sourcesOf(entry: string): Promise<string[]> {
  const sheet = readFileSync(join(dist, entry, STYLES), "utf8");
  const compiler = await compile(sheet, { base: join(dist, entry), onDependency: noop });
  const files = new Scanner({ sources: compiler.sources }).files;

  return files.map((file) => relative(dist, file)).toSorted();
}

/** The modules an app that imports all of `entry` keeps in its bundle, as paths under dist/. */
async function keptBy(entry: string): Promise<string[]> {
  const { modules } = await consume(
    `export * from ${JSON.stringify(specifier(`./${entry}`))};\n`,
    APP,
    realpathSync(join(TMP, "package")),
  );

  return [...modules.keys()].map((id) => relative(realpathSync(dist), id)).toSorted();
}

describe("an entry's styles.css", () => {
  it.each(FOLDERS)("%s names exactly the modules its tree-shaken bundle keeps", async (entry) => {
    expect(await sourcesOf(entry)).toStrictEqual(await keptBy(entry));
  });

  it("names none of the modules Button never runs, for components/button", async () => {
    const sources = await sourcesOf("components/button");

    expect(sources.filter((file) => NOT_IN_BUTTON.includes(file))).toStrictEqual([]);
  });
});

describe("an app's CSS", () => {
  it("holds a Button class and no class only Dialog sets, when it imports Button alone", async () => {
    const css = await cssOf(["components/button"]);

    expect({ button: css.includes(BUTTON_CLASS), dialog: css.includes(DIALOG_ONLY_CLASS) }).toStrictEqual({
      button: true,
      dialog: false,
    });
  });

  it("holds the Dialog-only class once it imports Dialog", async () => {
    expect(await cssOf(["components/button", "components/dialog"])).toContain(DIALOG_ONLY_CLASS);
  });

  it("holds no class of Dialog or Button when it imports no entry", async () => {
    const css = await cssOf([]);

    expect({ button: css.includes(BUTTON_CLASS), dialog: css.includes(DIALOG_ONLY_CLASS) }).toStrictEqual({
      button: false,
      dialog: false,
    });
  });
});
