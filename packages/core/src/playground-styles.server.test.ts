import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { publicFolders } from "../scripts/export-map.ts";
import { SRC } from "./test/bundle.ts";

// The playground is an app that imports the package through its export keys. Its stylesheet imports Tailwind, the theme
// and the file the ui() plugin writes, and its Vite config runs the plugin after Tailwind's.

const PLAYGROUND = join(SRC, "../../playground");

const IMPORTED = /"@workerstack\/ui\/([^".]+)"/gu;

/** The entries the playground's modules import, sorted. */
function importedEntries(): string[] {
  const src = join(PLAYGROUND, "src");
  const files = readdirSync(src, { recursive: true }).filter((file) => /\.tsx?$/u.test(String(file)));
  const texts = files.map((file) => readFileSync(join(src, String(file)), "utf8"));
  const specifiers = texts.flatMap((text) => [...text.matchAll(IMPORTED)]);

  return [...new Set(specifiers.map((match) => match[1] ?? ""))].toSorted();
}

describe("the playground's stylesheet", () => {
  it("imports Tailwind, the theme and the generated file, and no per-entry styles.css", () => {
    const css = readFileSync(join(PLAYGROUND, "src/styles.css"), "utf8");
    const imports = [...css.matchAll(/^@import "([^"]+)";$/gmu)].map((match) => match[1]);

    expect(imports).toStrictEqual(["tailwindcss", "@workerstack/ui/theme.css", "./ui.generated.css"]);
    expect(css).not.toMatch(/@workerstack\/ui\/.+\/styles\.css/u);
  });

  it("lists ui() in the Vite plugins after Tailwind's", () => {
    const config = readFileSync(join(PLAYGROUND, "vite.config.ts"), "utf8");
    const plugins = /plugins:\s*\[([^\]]*)\]/u.exec(config)?.[1] ?? "";

    expect(plugins.replaceAll(/\s/gu, "")).toBe("solid(),tailwind(),ui()");
  });

  it("names only entries the package has", () => {
    expect(importedEntries().filter((entry) => !publicFolders(SRC).includes(entry))).toStrictEqual([]);
  });
});
