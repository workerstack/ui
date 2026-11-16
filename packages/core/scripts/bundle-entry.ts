import solid from "@solidjs/vite-plugin";
import { build } from "vite";
import type { Plugin } from "vite";

import { VIRTUAL } from "./virtual.constants.ts";

// Bundles one module the way an app's build does: Vite with the Solid plugin and tree-shaking on, so what is left is
// the code an app would ship.

/** A bare import is a package, which stays out of the bundle. */
export function isExternal(id: string): boolean {
  return !(id.startsWith("\0") || id.startsWith(".") || id.startsWith("/"));
}

/** What a bundle holds: its code, the names its entry exports, and the bytes Rollup rendered for each module that kept
    code, by absolute path. */
export type Bundled = { code: string; exports: string[]; modules: Map<string, number> };

/** Bundles `source` as if it sat in `root`. `external` names the imports that stay out of the bundle. */
export async function bundleEntry(source: string, root: string, external: (id: string) => boolean): Promise<Bundled> {
  const entry: Plugin = {
    load: (id) => (id === VIRTUAL ? source : null),
    name: "entry",
    resolveId: (id) => (id === VIRTUAL ? VIRTUAL : null),
  };

  const result = await build({
    build: {
      minify: true,
      // Kept so a bare `export *` of an entry holds the entry's whole API, as an app that reads it all does.
      rollupOptions: { external, input: VIRTUAL, preserveEntrySignatures: "strict", treeshake: true },
      write: false,
    },
    configFile: false,
    logLevel: "silent",
    plugins: [solid(), entry],
    root,
  });

  const outputs = Array.isArray(result) ? result : [result];
  const chunk = outputs.flatMap((each) => ("output" in each ? each.output : [])).find((each) => each.type === "chunk");

  if (chunk === undefined) throw new Error("the bundle has no chunk");

  const kept = Object.entries(chunk.modules).filter(([, module]) => module.renderedLength > 0);

  return {
    code: chunk.code,
    exports: chunk.exports,
    modules: new Map(kept.map(([id, module]) => [id, module.renderedLength])),
  };
}
