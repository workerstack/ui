import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vitest/config";

// Components compile for the server and render to a string in Node, as in an SSR app.
export default defineConfig({
  plugins: [solid({ ssr: true })],
  test: {
    environment: "node",
    include: ["src/**/*.server.test.{ts,tsx}"],
    name: "server",
  },
});
