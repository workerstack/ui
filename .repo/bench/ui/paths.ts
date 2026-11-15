import { createRequire } from "node:module";
import path from "node:path";

/** This folder: the bench's own modules, which resolve their imports from the candidate's folder. */
export function benchDir(): string {
  return import.meta.dirname;
}

/** packages/core, the folder the ours and ui-sdk candidates resolve from. */
export function coreDir(): string {
  return path.resolve(benchDir(), "..", "..", "..", "packages", "core");
}

/** Where a candidate's bundles go. */
export function outDir(name: string): string {
  return path.resolve(benchDir(), "..", "..", "tmp", "bench-ui", name);
}

/** Vite, the Solid plugin and Playwright come from packages/core, the package that depends on them. */
export function coreRequire(): NodeJS.Require {
  return createRequire(path.join(coreDir(), "package.json"));
}
