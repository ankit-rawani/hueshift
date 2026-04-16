import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Bundle workspace packages into the output so the published package is self-contained
  noExternal: ["@hueshift/color-engine", "@hueshift/types", "culori"],
  // Keep MCP SDK and zod as external (listed in dependencies, npm will install them)
  external: ["@modelcontextprotocol/sdk", "zod"],
  sourcemap: false,
  dts: false,
});
