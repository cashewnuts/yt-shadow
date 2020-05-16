const path = require("path");
const WebpackWebExt = require('webpack-webext-plugin');

module.exports = {
  mode: 'development',
  entry: {
    "yt-shadow": "./src/yt-shadow.js"
  },
  output: {
    path: path.resolve(__dirname, "addon"),
    filename: "[name].js"
  },
  plugins: [
    new WebpackWebExt({
      runOnce: false,
      argv: ["lint", "-s", "src"],
    }),
    new WebpackWebExt({
      runOnce: true,
      maxRetries: 3,
      argv: ["run", "-s", "addon/", "--reload", "--bc", "-u", "https://www.youtube.com/watch?v=UfWh3OHYbEM"],
    })
  ]
};

