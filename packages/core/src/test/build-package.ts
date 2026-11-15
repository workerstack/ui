import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { buildStyles } from "../../scripts/build-styles.ts";
import { SRC } from "./bundle.ts";

// The package as `build` lays it out, in a folder of the test's own: dist/ from tsc without maps or declarations,
// theme.css, each entry's styles.css, and package.json, so an app can link the folder in as a package.

/** Builds the package into `target`, and returns its `dist/` folder. */
export async function buildPackage(target: string): Promise<string> {
  const root = join(SRC, "..");
  const dist = join(target, "dist");
  const flags = ["--outDir", dist, "--declaration", "false", "--declarationMap", "false", "--sourceMap", "false"];

  mkdirSync(target, { recursive: true });
  execFileSync("bunx", ["tsc", "-p", "tsconfig.build.json", ...flags], { cwd: root, stdio: "pipe" });
  copyFileSync(join(SRC, "theme.css"), join(dist, "theme.css"));
  await buildStyles(dist, SRC);
  copyFileSync(join(root, "package.json"), join(target, "package.json"));

  return dist;
}
