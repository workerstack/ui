import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { ViteDevServer } from "vite";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { SRC } from "../test/bundle.ts";
import {
  buildCss,
  builtEnv,
  closeAll,
  generatedText,
  makeApp,
  removeAll,
  serve,
  until,
  write,
} from "../test/vite-app.ts";
import type { Env } from "../test/vite-app.ts";

// The theme the plugin writes from `ui.config.ts`, the configs it refuses, and the dev server's reruns.

const CACHE = join(SRC, "..", "node_modules", ".cache", "ui-vite-theme");
const APPS = mkdtempSync(join(tmpdir(), "ui-vite-theme-"));
const CONFIG = "ui.config.ts";
const SCHEME_DARK = `.dark, [data-theme="dark"] { color-scheme: dark; }`;
const SCHEME_LIGHT = `.light, [data-theme="light"] { color-scheme: light; }`;
const UNSAFE = `ui: ui.config.ts tokens.radius holds ";", "{" or "}"; give one CSS value`;

const RICH = `{
  dark: "class",
  tokens: { radius: "0.75rem", "line-height": 1.5, primary: { light: "white", dark: "black" } },
  colors: { brand: "red" },
}`;

let env: Env = { apps: APPS, built: CACHE, ui: () => ({ name: "unset" }) };
const servers: ViteDevServer[] = [];

beforeAll(async () => {
  env = await builtEnv(APPS, CACHE);
}, 300_000);

afterEach(async () => {
  await closeAll(servers);
});

afterAll(() => {
  removeAll(CACHE, APPS);
});

/** A `ui.config.ts` that exports `body` as its default. */
function configOf(body: string): string {
  return `export default ${body};\n`;
}

/** Builds a fresh app whose config is `text`, and returns its generated file. */
async function generatedFor(name: string, text?: string): Promise<string> {
  const app = makeApp(env, name, "button-app");

  if (text !== undefined) write(app, CONFIG, text);

  await buildCss(env, app);

  return generatedText(app);
}

/** Starts a dev server on a fresh app whose config is `files`; `afterEach` closes it. */
async function serveWith(name: string, files: Record<string, string>): Promise<string> {
  const app = makeApp(env, name, "button-app");

  for (const [file, text] of Object.entries(files)) write(app, file, text);

  servers.push(await serve(env, app));

  return app;
}

describe("the theme the plugin writes", () => {
  it("imports base.css, writes a token and an own color, and the scheme rules for dark: class", async () => {
    const text = await generatedFor("theme-class", configOf(RICH));

    expect(text).toContain(`@import "@workerstack/ui/base.css";`);
    expect(text).toContain("--ui-radius: 0.75rem;");
    expect(text).toContain("--ui-line-height: 1.5;");
    expect(text).toContain("--ui-primary: light-dark(white, black);");
    expect(text).toContain("--ui-brand: red;");
    expect(text).toContain("@theme inline { --color-brand: var(--ui-brand); }");
    expect(text).toContain(SCHEME_DARK);
    expect(text).toContain(SCHEME_LIGHT);
  }, 120_000);

  it("writes the scheme rules and no :root without a config", async () => {
    const text = await generatedFor("theme-none");

    expect(text).toContain(SCHEME_DARK);
    expect(text).toContain(SCHEME_LIGHT);
    expect(text).not.toContain(":root");
  }, 120_000);

  it("writes neither scheme rule for dark: media", async () => {
    const text = await generatedFor("theme-media", configOf(`{ dark: "media" }`));

    expect(text).not.toContain("color-scheme");
  }, 120_000);
});

/** A refused config: its file text, and the message the build fails with. */
const REFUSED: [name: string, text: string, message: string][] = [
  ["could not load", `throw new Error("boom");\n`, "ui: ui.config.ts could not load: boom"],
  [
    "no default export",
    `export const x = 1;\n`,
    "ui: ui.config.ts has no default export; export default defineConfig({ ... })",
  ],
  [
    "an unknown token",
    configOf(`{ tokens: { radix: "1rem" } }`),
    "ui: ui.config.ts tokens.radix is not a token; the tokens are listed in @workerstack/ui/config",
  ],
  ["a value holding ;", configOf(`{ tokens: { radius: "1rem; color: red" } }`), UNSAFE],
  ["a value holding {", configOf(`{ tokens: { radius: "1rem { x" } }`), UNSAFE],
  ["a value holding }", configOf(`{ tokens: { radius: "1rem }" } }`), UNSAFE],
  [
    "an own color that is a token",
    configOf(`{ colors: { primary: "red" } }`),
    "ui: ui.config.ts colors.primary is a token; set it under tokens",
  ],
  [
    "a bad own color name",
    configOf(`{ colors: { Brand: "red" } }`),
    `ui: ui.config.ts colors.Brand is not a lowercase name like "brand" or "brand-muted"`,
  ],
];

describe("a config the plugin refuses", () => {
  it.each(REFUSED)(
    "fails the build for %s",
    async (_name, text, message) => {
      const app = makeApp(env, "bad-config", "button-app");

      write(app, CONFIG, text);

      await expect(buildCss(env, app)).rejects.toThrow(message);
    },
    120_000,
  );
});

describe("the dev server and the config", () => {
  it("rewrites the generated file after ui.config.ts changes", async () => {
    const app = await serveWith("dev-config", { [CONFIG]: configOf(`{ tokens: { radius: "1rem" } }`) });

    expect(generatedText(app)).toContain("--ui-radius: 1rem;");

    write(app, CONFIG, configOf(`{ tokens: { radius: "2rem" } }`));

    const text = await until(
      () => generatedText(app),
      (found) => found.includes("2rem"),
    );

    expect(text).toContain("--ui-radius: 2rem;");
  }, 120_000);

  it("rewrites the generated file after a file ui.config.ts imports changes", async () => {
    const app = await serveWith("dev-config-import", {
      [CONFIG]: `import { radius } from "./radius.ts";\n\nexport default { tokens: { radius } };\n`,
      "radius.ts": `export const radius = "1rem";\n`,
    });

    expect(generatedText(app)).toContain("--ui-radius: 1rem;");

    write(app, "radius.ts", `export const radius = "3rem";\n`);

    const text = await until(
      () => generatedText(app),
      (found) => found.includes("3rem"),
    );

    expect(text).toContain("--ui-radius: 3rem;");
  }, 120_000);
});
