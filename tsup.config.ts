import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: ["src/index.ts", "src/piconvert.ts"],
    outDir: "dist",
    target: "node16",
    format: ["cjs", "esm"],
    shims: true,
    clean: true,
    splitting: false,
    minify: !options.watch,
    dts: options.watch ? false : true,
}));
