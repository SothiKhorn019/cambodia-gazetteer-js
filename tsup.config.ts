import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // JSON data is inlined, so the package works in Node and bundlers with no JSON import support.
  target: "es2020",
  platform: "neutral",
  clean: true,
  // Inlined data is ~70% of the output; dropping whitespace keeps dist close to the raw JSON size.
  minifyWhitespace: true,
  // Keep Khmer as UTF-8 instead of \u escapes (smaller, and readable in dist).
  esbuildOptions(options) {
    options.charset = "utf8";
  },
});
