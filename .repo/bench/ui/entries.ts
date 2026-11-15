import { KIT_ID, PAGE_ID } from "./bench.constants.ts";

/** The app module's path and the name its kit module exports the kit under. */
export type KitRef = { app: string; name: string };

function appImports(kit: KitRef): string[] {
  return [`import { createApp } from ${JSON.stringify(kit.app)};`, `import { ${kit.name} as kit } from "${KIT_ID}";`];
}

// The client entry times hydrate() or render() to a settled, laid-out DOM: Solid's flush, a task
// for effects scheduled after it, then a layout read.
const CLIENT = [
  `import { createComponent, hydrate, render } from "@solidjs/web";`,
  `import { flush } from "solid-js";`,
  `import { check } from "${PAGE_ID}";`,
  "const App = createApp(kit);",
  "const tick = () => new Promise((resolve) => {",
  "  const channel = new MessageChannel();",
  "  channel.port1.onmessage = () => resolve();",
  "  channel.port2.postMessage(0);",
  "});",
  "async function time(start) {",
  `  const root = document.getElementById("root");`,
  `  const before = [...root.querySelectorAll("*")];`,
  "  const t0 = performance.now();",
  "  start(() => createComponent(App, {}), root);",
  "  flush();",
  "  await tick();",
  "  root.getBoundingClientRect();",
  "  const ms = performance.now() - t0;",
  "  return { ms, replaced: before.filter((element) => !element.isConnected).length };",
  "}",
  "window.bench = { check, hydrate: () => time(hydrate), mount: () => time(render) };",
];

const SERVER = [
  `import { createComponent, generateHydrationScript, renderToString } from "@solidjs/web";`,
  "const App = createApp(kit);",
  "export const renderApp = () => renderToString(() => createComponent(App, {}));",
  "export const hydrationScript = () => generateHydrationScript();",
];

const SIZE = [
  `import { createComponent, hydrate } from "@solidjs/web";`,
  "const App = createApp(kit);",
  `hydrate(() => createComponent(App, {}), document.getElementById("root"));`,
];

/** The entry modules every candidate builds: the same code for each, on its own kit. */
export function entries(kit: KitRef): Map<string, string> {
  const head = appImports(kit);

  return new Map([
    ["virtual:bench-client", [...head, ...CLIENT].join("\n")],
    ["virtual:bench-server", [...head, ...SERVER].join("\n")],
    ["virtual:bench-size", [...head, ...SIZE].join("\n")],
  ]);
}
