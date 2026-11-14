import solid from "@solidjs/vite-plugin";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { PORT } from "./src/playground.constants.ts";

// A consumer's setup, nothing more: Solid, Tailwind, and @workerstack/ui from its exports (dist/).
export default defineConfig({
  plugins: [solid(), tailwind()],
  server: { port: PORT },
});
