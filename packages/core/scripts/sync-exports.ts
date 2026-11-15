// Writes the export map, derived from the folders under src/, into package.json's `exports`.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { exportMap } from "./export-map.ts";

const INDENT = 2;
const HEX = 16;
const ESCAPE_WIDTH = 4;

/** A character outside ASCII, which package.json keeps as a `\u` escape. */
const NON_ASCII = /[^\0-\u007F]/gu;

function escape(char: string): string {
  return `\\u${char.charCodeAt(0).toString(HEX).padStart(ESCAPE_WIDTH, "0")}`;
}

/** Rewrites `exports` in the package.json under `root`, keeping the rest as it is. */
function sync(root: string): void {
  const file = join(root, "package.json");
  const manifest = JSON.parse(readFileSync(file, "utf8")) /* our package.json */ as object;
  const json = JSON.stringify({ ...manifest, exports: Object.fromEntries(exportMap(join(root, "src"))) }, null, INDENT);
  writeFileSync(file, `${json.replaceAll(NON_ASCII, escape)}\n`);
}

if (import.meta.main) sync(join(dirname(fileURLToPath(import.meta.url)), ".."));
