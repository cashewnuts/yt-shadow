const path = require("path");
const WebpackWebExt = require("webpack-webext-plugin");

const { NODE_ENV = "development" } = process.env;

const webpackConfig = {
  mode: NODE_ENV,
  entry: {
    "yt-shadow": "./src/yt-shadow.ts",
  },
  output: {
    path: path.resolve(__dirname, "addon"),
    filename: "[name].js",
  },
  plugins: [],
};

if (NODE_ENV === "development") {
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
