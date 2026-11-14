// Runs @workerstack/ui's watch build and Vite side by side. The playground imports the package from
// dist/, as an app does, so the watch build is what puts a component change on the page.
import { type ChildProcess, spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** tsc's line once its first compile is in dist/. */
const WATCHING = "Watching for file changes";

function main(): void {
  const here = join(dirname(fileURLToPath(import.meta.url)), "..");
  const children: ChildProcess[] = [];

  function stop(code = 0): void {
    for (const child of children) child.kill("SIGTERM");
    process.exit(code);
  }

  process.on("SIGINT", () => stop());

  process.on("SIGTERM", () => stop());

  // The watch build clears dist/ first, so Vite starts only after tsc's first compile is done.
  const build = spawn("bun", ["run", "dev"], { cwd: join(here, "../core"), stdio: ["ignore", "pipe", "inherit"] });

  children.push(build);

  build.on("exit", (code) => stop(code ?? 1));

  let isViteStarted = false;

  build.stdout.on("data", (chunk: Buffer) => {
    process.stdout.write(chunk);

    if (isViteStarted || !chunk.toString().includes(WATCHING)) return;
    isViteStarted = true;
    const vite = spawn("bunx", ["vite"], { cwd: here, stdio: "inherit" });
    children.push(vite);
    vite.on("exit", (code) => stop(code ?? 1));
  });
}

main();
