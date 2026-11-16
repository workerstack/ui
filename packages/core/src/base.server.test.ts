import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { compile, optimize } from "@tailwindcss/node";
import { describe, expect, it } from "vitest";

// The layers Tailwind makes of base.css: UI SDK's rules sit in a layer inside Tailwind's theme layer, so they stay
// below base, components and utilities without the app writing a `@layer ui-sdk;` line.

const SRC = dirname(fileURLToPath(import.meta.url));

/** The CSS Tailwind makes of `@import "tailwindcss"` and base.css, optimized as a build does. */
async function compiled(): Promise<string> {
  const css = `@import "tailwindcss";\n@import "${join(SRC, "base.css")}";`;
  const compiler = await compile(css, { base: SRC, onDependency: () => undefined });

  return optimize(compiler.build(["flex"])).code;
}

describe("base.css after Tailwind", () => {
  it("holds UI SDK's rules inside the theme layer's ui-sdk layer", async () => {
    const css = await compiled();
    const theme = css.indexOf("@layer theme {");
    const inner = css.indexOf("@layer ui-sdk", theme);
    const token = css.indexOf("--ui-background:");

    expect([theme, inner, token].every((at) => at >= 0)).toBe(true);
    expect(theme).toBeLessThan(inner);
    expect(inner).toBeLessThan(token);
  });

  it("orders the utilities layer after the theme layer", async () => {
    const css = await compiled();

    expect(css.indexOf("@layer theme {")).toBeLessThan(css.indexOf("@layer utilities {"));
  });
});
