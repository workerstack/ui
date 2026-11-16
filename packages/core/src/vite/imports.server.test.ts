import { describe, expect, it } from "vitest";

import { usedExports } from "./imports.ts";
import type { Used } from "./imports.ts";

// What a source file takes from @workerstack/ui, folder by folder: the names it imports, or "all" when it can take
// any (a namespace, a re-export of everything, a dynamic import, or text the parser cannot read).

const BUTTON = "components/button";
const DIALOG = "components/dialog";
const BUTTON_SPECIFIER = `@workerstack/ui/${BUTTON}`;
const DIALOG_SPECIFIER = `@workerstack/ui/${DIALOG}`;

/** The Used map a file should give, from folder to names or "all". */
function used(entries: Record<string, readonly string[] | "all">): Used {
  return new Map(
    Object.entries(entries).map(([folder, names]) => [folder, names === "all" ? names : new Set(names)] as const),
  );
}

describe("usedExports on JS and TS source", () => {
  it.each(["a.js", "a.jsx", "a.ts", "a.tsx", "a.mjs", "a.cjs", "a.mts", "a.cts"])("reads %s", (file) => {
    const code = `import { Button } from "${BUTTON_SPECIFIER}";\nexport const x = Button;\n`;

    expect(usedExports(code, file)).toStrictEqual(used({ [BUTTON]: ["Button"] }));
  });

  it("adds each named import, across statements and folders", () => {
    const code = [
      `import { Button, ButtonGroup } from "${BUTTON_SPECIFIER}";`,
      `import { Dialog } from "${DIALOG_SPECIFIER}";`,
      `import { Spinner } from "${BUTTON_SPECIFIER}";`,
    ].join("\n");

    expect(usedExports(code, "a.ts")).toStrictEqual(
      used({ [BUTTON]: ["Button", "ButtonGroup", "Spinner"], [DIALOG]: ["Dialog"] }),
    );
  });

  it("reads the imported name of an `as` alias, not the local one", () => {
    const code = `import { Button as Local } from "${BUTTON_SPECIFIER}";\nexport { Local };\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: ["Button"] }));
  });

  it("adds the name of `export { X } from`, and reads the source name of `export { X as Y } from`", () => {
    const code = [
      `export { Button } from "${BUTTON_SPECIFIER}";`,
      `export { Dialog as Modal } from "${DIALOG_SPECIFIER}";`,
    ].join("\n");

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: ["Button"], [DIALOG]: ["Dialog"] }));
  });
});

describe("usedExports on whole-folder takes", () => {
  it("adds all for `import * as`", () => {
    const code = `import * as ui from "${BUTTON_SPECIFIER}";\nexport { ui };\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: "all" }));
  });

  it("adds all for `export * from`", () => {
    const code = `export * from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: "all" }));
  });

  it("adds all for `export * as ns from`", () => {
    const code = `export * as ui from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: "all" }));
  });

  it("adds all for a dynamic import()", () => {
    const code = `export const load = () => import("${BUTTON_SPECIFIER}");\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: "all" }));
  });

  it("keeps all when a named import of the same folder follows", () => {
    const code = `import * as ui from "${BUTTON_SPECIFIER}";\nimport { Button } from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: "all" }));
  });

  it("keeps all when a namespace import of the same folder follows", () => {
    const code = `import { Button } from "${BUTTON_SPECIFIER}";\nimport * as ui from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: "all" }));
  });
});

describe("usedExports on types and other packages", () => {
  it("adds none for `import type`", () => {
    const code = `import type { ButtonProps } from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({}));
  });

  it("adds none for a type-only specifier", () => {
    const code = `import { type ButtonProps } from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({}));
  });

  it("adds none for `export type { X } from`", () => {
    const code = `export type { ButtonProps } from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({}));
  });

  it("adds only the value names beside a type-only specifier", () => {
    const code = `import { type ButtonProps, Button } from "${BUTTON_SPECIFIER}";\n`;

    expect(usedExports(code, "a.ts")).toStrictEqual(used({ [BUTTON]: ["Button"] }));
  });

  it("ignores specifiers that are not a folder of @workerstack/ui", () => {
    const code = [
      `import { Button } from "@workerstack/other/components/button";`,
      `import { Button as Kit } from "@workerstack/uikit/components/button";`,
      `import { createSignal } from "solid-js";`,
      `import { local } from "./components/button";`,
    ].join("\n");

    expect(usedExports(code, "a.ts")).toStrictEqual(used({}));
  });
});

describe("usedExports on a file it cannot read", () => {
  it.each(["a.vue", "a.svelte", "a.md", "a.astro", "a.html"])(
    "adds all for each folder %s names, whatever the text around it",
    (file) => {
      const code = [
        `<script>`,
        `import { Button } from "${BUTTON_SPECIFIER}";`,
        `</script>`,
        `See '${DIALOG_SPECIFIER}'.`,
        ``,
      ].join("\n");

      expect(usedExports(code, file)).toStrictEqual(used({ [BUTTON]: "all", [DIALOG]: "all" }));
    },
  );

  it("adds none for a non-JS file that names no folder", () => {
    expect(usedExports("# Title\nimport { Button } from 'elsewhere'\n", "a.md")).toStrictEqual(used({}));
  });

  it("adds all for each folder a .ts file that fails to parse names", () => {
    const code = [
      `import { Button } from "${BUTTON_SPECIFIER}";`,
      `import { Dialog } from "${DIALOG_SPECIFIER}";`,
      `const = ;`,
      ``,
    ].join("\n");

    expect(usedExports(code, "odd.ts")).toStrictEqual(used({ [BUTTON]: "all", [DIALOG]: "all" }));
  });

  it("adds nothing for a .ts file that fails to parse and names no folder", () => {
    expect(usedExports(`import { createSignal } from "solid-js";\nconst = ;\n`, "odd.ts")).toStrictEqual(used({}));
  });
});
