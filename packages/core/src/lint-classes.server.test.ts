import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// The root lint config, run on a fixture of bad classes and vars: it must refuse each of the four.

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const FIXTURE = "packages/core/src/__fixtures__/lint-classes/bad.tsx";

/** The parts of the config the test reads; the rest is written back as it is. */
type Config = { ignorePatterns?: string[] };

/** One finding oxlint printed. */
type Diagnostic = { code: string; labels: { span: { line: number } }[] };

/** What the run printed and its exit code. */
type Run = { diagnostics: Diagnostic[]; status: number | null };

/** Lints the fixture with the root config minus the ignore entries that hide `__fixtures__`. */
function lintFixture(): Run {
  const config = join(ROOT, `.oxlintrc.lint-classes-${process.pid}.json`);
  const source = readFileSync(join(ROOT, ".oxlintrc.jsonc"), "utf8").replace(/^\/\/.*\n/, "");
  const parsed = JSON.parse(source) /* the root config is generated JSON with this shape */ as Config;
  const ignorePatterns = (parsed.ignorePatterns ?? []).filter((pattern) => !pattern.includes("__fixtures__"));

  try {
    writeFileSync(config, JSON.stringify({ ...parsed, ignorePatterns }));

    const run = spawnSync("bun", ["x", "--bun", "oxlint", "-c", config, "-f", "json", FIXTURE], {
      cwd: ROOT,
      encoding: "utf8",
    });

    const out = JSON.parse(run.stdout) /* oxlint -f json prints this shape */ as { diagnostics: Diagnostic[] };

    return { diagnostics: out.diagnostics, status: run.status };
  } finally {
    rmSync(config, { force: true });
  }
}

describe("the root lint config", () => {
  it("refuses an unknown class, an unknown arbitrary var, an undefined var() and a pieced class", () => {
    const { diagnostics, status } = lintFixture();

    const found = diagnostics.map((item) => `${item.labels[0]?.span.line}:${item.code}`).toSorted();

    expect(status).not.toBe(0);
    expect(found).toStrictEqual(
      [
        "7:tailwindcss(no-unknown-classes)",
        "8:repo(no-undefined-var)",
        "9:repo(no-undefined-var)",
        "10:tailwindcss(no-dynamic-classes)",
      ].toSorted(),
    );
  });
});
