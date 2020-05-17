const path = require("path");
const WebpackWebExt = require("webpack-webext-plugin");

const { NODE_ENV = "development" } = process.env;

const webpackConfig = {
  mode: NODE_ENV,
  entry: {
    "yt-shadow": "./src/yt-shadow.ts",
    "popup/popup": "./src/popup.ts",
  },
  output: {
    path: path.resolve(__dirname, "addon"),
    filename: "[name].js",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
  plugins: [],
};

if (NODE_ENV === "development") {
  webpackConfig.devtool = "inline-source-map";
  webpackConfig.plugins = [
    ...webpackConfig.plugins,
    new WebpackWebExt({
      runOnce: false,
      argv: ["lint", "-s", "addon"],
    }),
    new WebpackWebExt({
      runOnce: true,
      maxRetries: 3,
      argv: [
        "run",
        "-s",
        "addon/",
        "--reload",
        "-u",
        "https://www.youtube.com/watch?v=UfWh3OHYbEM",
      ],
    }),
  ];
}

module.exports = webpackConfig;
