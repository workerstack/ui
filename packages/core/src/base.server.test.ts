import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { compile, optimize } from "@tailwindcss/node";
import { describe, expect, it } from "vitest";

// The layers Tailwind makes of base.css: UI SDK's rules sit in a layer inside Tailwind's theme layer, so they stay
// below base, components and utilities without the app writing a `@layer ui-sdk;` line.

const SRC = dirname(fileURLToPath(import.meta.url));

/** The CSS Tailwind makes of `@import "tailwindcss"` and base.css, optimized as a build does. */
async function compiled(before = "", after = ""): Promise<string> {
  const css = `${before}\n@import "tailwindcss";\n@import "${join(SRC, "base.css")}";\n${after}`;
  const compiler = await compile(css, { base: SRC, onDependency: () => undefined });

  return optimize(compiler.build(["flex"])).code;
}

/** The layer a declaration at `at` sits in: the nearest `@layer` opened before it and not yet closed. */
function layerAt(css: string, at: number): string | undefined {
  const stack: string[] = [];

  for (const match of css.slice(0, at).matchAll(/@layer ([\w.-]+) \{|\n\}/g)) {
    if (match[1] === undefined) stack.pop();
    else stack.push(match[1]);
  }

  return stack.at(-1);
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

  it("defaults the option tokens in the theme layer, so an unlayered or later-layer :root beats them", async () => {
    const css = await compiled(":root { --ui-chart-1: red; }", "@layer components { :root { --ui-chart-1: blue; } }");

    const placed = [...css.matchAll(/--ui-chart-1:\s*([^;]+);/g)].map((match) => ({
      layer: layerAt(css, match.index),
      value: match[1] ?? "",
    }));

    expect(placed.find((item) => item.value === "red")?.layer).toBeUndefined();
    expect(placed.find((item) => item.value === "blue")?.layer).toBe("components");
    expect(placed.find((item) => item.value.startsWith("oklch"))?.layer).toBe("theme.ui-sdk");
    // Layers rank by first appearance: the theme layer comes before components, so it loses to it.
    expect(css.indexOf("@layer theme {")).toBeLessThan(css.indexOf("@layer components {"));
  });
});
