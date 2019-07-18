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
    babelPlugin({
      presets: [
        [
          "@babel/preset-env",
          {
            loose: true,
            shippedProposals: true,
            targets: {
              node: "current",
              ie: 11,
              firefox: 50,
              chrome: 50,
            },
            exclude: [
              "transform-typeof-symbol"
            ]
          }
        ],
        [
          "@babel/preset-react"
        ],
      ],
      plugins: [
        "@babel/plugin-syntax-flow",
        "@babel/plugin-transform-flow-strip-types",
      ],
    }),
  ],
  external: [
    "diskho",
    "react",
  ],
};
