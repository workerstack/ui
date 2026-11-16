import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { findEntries, GENERATED_FILE, importsGenerated } from "./entries.ts";
import { classesOf, generatedText, parseManifest } from "./generated.ts";
import type { Manifest } from "./generated.ts";
import { merge, usedExports } from "./imports.ts";
import type { Used } from "./imports.ts";
import { PACKAGE_NAME } from "./package-name.constants.ts";
import { findConsumers } from "./packages.ts";
import { filesUnder, sourcesOf } from "./sources.ts";

// One pass of the plugin: write each entry's generated file from what the app and the packages it installs import.

const MANIFEST = "classes.json";

/** Where a pass reports to: the app's folder, and a warning sink. */
export type Report = { root: string; warn: (message: string) => void };

/** What a pass found, for the dev server to watch: the generated files it wrote and every file it read. */
export type Pass = { generated: Set<string>; watched: Set<string> };

/** The manifest the build wrote beside the plugin's own build. */
const MANIFEST_FILE = /* @__PURE__ */ fileURLToPath(/* @__PURE__ */ new URL(`../${MANIFEST}`, import.meta.url));

/** Reads the manifest at `path`; throws a message that says what to do when it is missing or malformed. */
function readManifest(path: string): Manifest {
  const text = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  const manifest = text === undefined ? undefined : parseManifest(text);

  const reason = text === undefined ? "missing" : "not a manifest";

  if (manifest === undefined) throw new Error(`ui: ${path} is ${reason}; reinstall ${PACKAGE_NAME}`);

  return manifest;
}

/** The generated file beside `entry`. */
function generatedOf(entry: string): string {
  return join(dirname(entry), GENERATED_FILE);
}

/** Writes `file` with `text` when it differs. */
function writeIfChanged(file: string, text: string): void {
  if (existsSync(file) && readFileSync(file, "utf8") === text) return;

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

/** Gives each entry an empty generated file when it has none, so its `@import` resolves on a fresh clone. */
function seed(entries: readonly string[]): void {
  const missing = entries.filter((entry) => !existsSync(generatedOf(entry)));

  for (const entry of missing) writeFileSync(generatedOf(entry), generatedText([]));
}

/** The files Tailwind scans for `entry`, warning when its CSS lacks the import of the generated file. */
function scanEntry(entry: string, report: Report): Promise<string[]> {
  const css = readFileSync(entry, "utf8");

  if (!importsGenerated(css)) {
    report.warn(
      `ui: ${relative(report.root, entry)} does not import "./${GENERATED_FILE}"; add it after @import "tailwindcss"`,
    );
  }

  return sourcesOf(css, entry, report.root);
}

/** What `file` takes from the package, merged into `used`. */
function readUsed(used: Used, file: string, report: Report): void {
  if (!existsSync(file)) return;

  const path = relative(report.root, file);
  const message = `ui: could not parse ${path}; it counts as importing every export of the entries it names`;

  merge(
    used,
    usedExports(readFileSync(file, "utf8"), file, () => report.warn(message)),
  );
}

/** Writes the generated file of each entry under `report.root`; returns what to watch. */
export async function generate(report: Report): Promise<Pass> {
  const manifestFile = MANIFEST_FILE;
  const manifest = readManifest(manifestFile);
  const entries = findEntries(report.root);
  const generated = new Set(entries.map(generatedOf));
  const watched = new Set([manifestFile, ...entries]);

  if (entries.length === 0) {
    report.warn(`ui: no CSS file under ${report.root} imports "tailwindcss"; nothing to write`);

    return { generated, watched };
  }

  seed(entries);
  const scans = await Promise.all(entries.map((entry) => scanEntry(entry, report)));
  const { consumers, manifests } = findConsumers(report.root);
  const files = new Set([...scans.flat(), ...consumers.flatMap((consumer) => filesUnder(consumer))]);
  const used: Used = new Map();

  for (const file of files) {
    if (!generated.has(file)) readUsed(used, file, report);
    watched.add(file);
  }

  for (const path of manifests) watched.add(path);

  for (const file of generated) writeIfChanged(file, generatedText(classesOf(manifest, used)));

  return { generated, watched };
}
