module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties"
  ],
  env: {
    development: {
      plugins: [
        "react-element-info"
      ]
    },
    test: {
      plugins: [
        "react-element-info",
        "@babel/plugin-transform-runtime",
        ["polyfill-corejs3", { "method": "usage-global" }]
      ],
      presets: [
        "@babel/preset-env",
        "@babel/preset-react"
      ]
    }
  }
};
