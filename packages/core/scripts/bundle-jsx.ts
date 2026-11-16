import { rolldown } from "rolldown";
import type { Plugin } from "rolldown";

import { VIRTUAL } from "./virtual.constants.ts";

// Bundles one module with tree-shaking on and JSX kept as written. Solid's compiler turns a static `class="a b"` into
// an unquoted template attribute, which Tailwind's scanner skips, so the classes are read from the uncompiled bundle.

/** What a bundle holds: its code and the names its entry exports. */
export type BundledJsx = { code: string; exports: string[] };

/** Bundles `source`. `external` names the imports that stay out of the bundle. */
export async function bundleJsx(source: string, external: (id: string) => boolean): Promise<BundledJsx> {
  const entry: Plugin = {
    load: (id) => (id === VIRTUAL ? source : null),
    name: "entry",
    resolveId: (id) => (id === VIRTUAL ? VIRTUAL : null),
  };

  const bundle = await rolldown({
    external,
    input: VIRTUAL,
    moduleTypes: { ".jsx": "jsx" },
    plugins: [entry],
    preserveEntrySignatures: "strict",
    transform: { jsx: "preserve" },
    treeshake: true,
  });

  try {
    const { output } = await bundle.generate({ format: "esm" });
    const chunk = output.find((each) => each.type === "chunk");

    if (chunk === undefined) throw new Error("the bundle has no chunk");

    return { code: chunk.code, exports: chunk.exports };
  } finally {
    await bundle.close();
  }
}
