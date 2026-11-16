import { defineConfig } from "@workerstack/ui/config";

export default defineConfig({
  colors: { brand: "oklch(0.7 0.15 30)" },
  dark: "class",
  tokens: {
    checker: "repeating-conic-gradient(red 0 25%, blue 0 50%)",
    "icon-star": "url(star.svg)",
    "line-height": 1.5,
    "rating-direction": "to left",
    "font-sans": "Inter, sans-serif",
    primary: { dark: "oklch(0.7 0.17 255)", light: "oklch(0.55 0.2 255)" },
    radius: "0.75rem",
    shadow: "0 1px 2px rgb(0 0 0 / 0.1)",
  },
});
