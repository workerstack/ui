import { readFileSync } from "node:fs";
import path from "node:path";

import type * as Playwright from "playwright";
import type { Browser, BrowserContext } from "playwright";

import { HTML, ISOLATION, JS, NOT_FOUND, ORIGIN, PAGE_SAMPLES, PAGE_WARMUP } from "./bench.constants.ts";
import { EXPECTED, LABELS } from "./expect.ts";
import { coreRequire } from "./paths.ts";
import type { Rendered } from "./server.ts";

type Kind = "hydrate" | "mount";

type Timed = { ms: number; replaced: number };

type File = { body: string; type: string };

/** The in-page check, called with what the closed app must show and what to click. */
function checkCall(): string {
  return `window.bench.check(${JSON.stringify(EXPECTED)}, ${JSON.stringify(LABELS)})`;
}

/** Each sample's hydrate and mount times. */
export type PageTimes = { hydrate: number[]; mount: number[] };

function page(head: string, body: string, script: string): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8">${head}</head>` +
    `<body><div id="root">${body}</div><script type="module" src="/${script}"></script></body></html>`
  );
}

function files(dir: string, rendered: Rendered): Map<string, File> {
  function js(file: string): File {
    return { body: readFileSync(path.join(dir, file), "utf8"), type: JS };
  }

  return new Map([
    ["/hydrate", { body: page(rendered.script, rendered.html, "hydrate.js"), type: HTML }],
    ["/hydrate.js", js("hydrate.js")],
    ["/mount", { body: page("", "", "mount.js"), type: HTML }],
    ["/mount.js", js("mount.js")],
  ]);
}

async function serve(browser: Browser, served: Map<string, File>): Promise<BrowserContext> {
  const context = await browser.newContext();

  await context.route(`${ORIGIN}/**`, async (route) => {
    const file = served.get(new URL(route.request().url()).pathname);

    await (file === undefined
      ? route.fulfill({ status: NOT_FOUND })
      : route.fulfill({ body: file.body, contentType: file.type, headers: ISOLATION }));
  });

  return context;
}

/** One fresh page: times the kind, then checks what it rendered and that it reacts. */
async function sample(context: BrowserContext, kind: Kind): Promise<number> {
  const tab = await context.newPage();
  const errors: string[] = [];

  tab.on("pageerror", (error) => errors.push(`page error: ${error.message}`));

  try {
    await tab.goto(`${ORIGIN}/${kind}`);
    await tab.waitForFunction("'bench' in window");

    const timed: Timed = await tab.evaluate(`window.bench.${kind}()`);
    const checked: string[] = await tab.evaluate(checkCall());
    const isReplaced = kind === "hydrate" && timed.replaced > 0;
    const replaced = isReplaced ? [`hydration replaced ${timed.replaced} server elements`] : [];
    const problems = [...checked, ...replaced, ...errors];

    if (problems.length > 0) throw new Error(`${kind}: ${problems.join("; ")}`);

    return timed.ms;
  } finally {
    await tab.close();
  }
}

async function samples(context: BrowserContext, left: number, times: PageTimes): Promise<PageTimes> {
  if (left === 0) return times;

  const hydrated = await sample(context, "hydrate");
  const mounted = await sample(context, "mount");
  const sampled = { hydrate: [...times.hydrate, hydrated], mount: [...times.mount, mounted] };
  const kept = left <= PAGE_SAMPLES ? sampled : times;

  return samples(context, left - 1, kept);
}

/** Times hydrate and mount in headless Chromium, alternating, on a fresh page each. */
export async function timePages(dir: string, rendered: Rendered): Promise<PageTimes> {
  const playwright: unknown = coreRequire()("playwright");
  const browser = await (playwright /* Playwright's CommonJS entry */ as typeof Playwright).chromium.launch();

  try {
    const context = await serve(browser, files(dir, rendered));

    return await samples(context, PAGE_WARMUP + PAGE_SAMPLES, { hydrate: [], mount: [] });
  } finally {
    await browser.close();
  }
}
