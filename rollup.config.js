import babelPlugin from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: [
    {
      dir: "dist",
      entryFileNames: "[name].esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      dir: "dist",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: [
    babelPlugin(require("./build/babel")),
  ],
  preserveModules: true,
  external: [
    "react",
  ],
};
