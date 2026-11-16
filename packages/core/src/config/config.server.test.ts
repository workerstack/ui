import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

import { describe, expect, it } from "vitest";

import { TOKENS } from "./tokens.ts";

// The config's types, checked by the compiler an app would use, and their token list against UI SDK's stylesheet.

const require = createRequire(import.meta.url);

/** The workspace's tsc; `typescript`'s exports hide bin/, so it is found beside the module they expose. */
const TSC = join(dirname(require.resolve("typescript")), "..", "bin", "tsc");
const FIXTURES = fileURLToPath(new URL("__fixtures__/", import.meta.url));

/** What a tsc run printed, and its exit code. */
type Run = { output: string; status: number | null };

/** Runs tsc on one fixture's `ui.config.ts` through a temporary project; pretty output quotes the failing line. */
function tsc(fixture: string): Run {
  const dir = mkdtempSync(join(tmpdir(), "ui-config-"));

  try {
    const project = join(dir, "tsconfig.json");
    writeFileSync(
      project,
      JSON.stringify({ extends: `${FIXTURES}tsconfig.json`, files: [`${FIXTURES}${fixture}/ui.config.ts`] }),
    );

    const run = spawnSync(process.execPath, [TSC, "-p", project, "--pretty", "true"], { encoding: "utf8" });

    return { output: stripVTControlCharacters(run.stdout + run.stderr), status: run.status };
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
}

describe("ui.config.ts types", () => {
  it("accepts one token of each kind, a light and dark color and an own color", () => {
    const { output, status } = tsc("good");

    expect(output).toBe("");
    expect(status).toBe(0);
  });

  it("refuses a length given to a color token", () => {
    const { output, status } = tsc("length-as-color");

    expect(status).not.toBe(0);
    expect(output).toContain("TS2322");
    expect(output).toContain("primary");
  });
});

describe("TOKENS", () => {
  it("names every --ui-* property UI SDK's web.css defines, but the --ui-icon slot", () => {
    const css = readFileSync(require.resolve("@ui-sdk/core/web.css"), "utf8");
    const defined = new Set([...css.matchAll(/(--ui-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
    defined.delete("--ui-icon");

    expect(new Set(Object.keys(TOKENS).map((name) => `--ui-${name}`))).toStrictEqual(defined);
    expect(defined.size).toBe(35);
  });
});
