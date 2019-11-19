import babelPlugin from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: [
    {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
    },
    {
      dir: "dist/cjs",
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
