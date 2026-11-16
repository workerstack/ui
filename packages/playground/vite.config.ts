import solid from "@solidjs/vite-plugin";
import tailwind from "@tailwindcss/vite";
import { ui } from "@workerstack/ui/vite";
import { defineConfig } from "vite";

import { PORT } from "./src/playground.constants.ts";

// A consumer's setup, nothing more: Solid, Tailwind, and the @workerstack/ui plugin, which writes the classes of the
// exports the app imports into src/ui.generated.css. The components come from the package exports (dist/).
export default defineConfig({
  plugins: [solid(), tailwind(), ui()],
  server: { port: PORT },
});
