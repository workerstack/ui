import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { publicFolders } from "../scripts/export-map.ts";
import { SRC } from "./test/bundle.ts";

// The playground is an app that imports the package through its export keys. Its stylesheet must import one styles.css
// per entry its sources import, so Tailwind builds the classes of those entries, no more and no fewer.

const PLAYGROUND = join(SRC, "../../playground/src");

const IMPORTED = /"@workerstack\/ui\/([^".]+)"/gu;
const STYLED = /^@import "@workerstack\/ui\/([^"]+)\/styles\.css";$/gmu;

/** The entries the playground's modules import, sorted. */
function importedEntries(): string[] {
  const files = readdirSync(PLAYGROUND, { recursive: true }).filter((file) => /\.tsx?$/u.test(String(file)));
  const texts = files.map((file) => readFileSync(join(PLAYGROUND, String(file)), "utf8"));
  const specifiers = texts.flatMap((text) => [...text.matchAll(IMPORTED)]);

  return [...new Set(specifiers.map((match) => match[1] ?? ""))].toSorted();
}

describe("the playground's stylesheet", () => {
  it("imports a styles.css for each entry its sources import", () => {
    const css = readFileSync(join(PLAYGROUND, "styles.css"), "utf8");
    const styled = [...css.matchAll(STYLED)].map((match) => match[1] ?? "").toSorted();

    const hint = 'add or drop an `@import "@workerstack/ui/<entry>/styles.css";` line in the playground styles.css';

    expect(styled, hint).toStrictEqual(importedEntries());
  });

  it("names only entries the package has", () => {
    expect(importedEntries().filter((entry) => !publicFolders(SRC).includes(entry))).toStrictEqual([]);
  });
});
