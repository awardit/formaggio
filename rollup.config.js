import babelPlugin from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.esm.js",
      sourcemap: true,
      format: "esm",
    },
    {
      file: "dist/index.js",
      sourcemap: true,
      format: "cjs",
    },
  ],
  plugins: [
    babelPlugin(require("./build/babel")),
  ],
  external: [
    "diskho",
    "react",
  ],
};
