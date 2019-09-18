import babelPlugin from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.esm.js",
      sourcemap: true,
      format: "esm",
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
